import assert from "node:assert/strict";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { spawn } from "node:child_process";
const url =
  process.env.TEST_BASE_URL ||
  `http://127.0.0.1:4173${process.env.SITE_BASE_PATH || "/"}`;
let server;
if (!process.env.TEST_BASE_URL) {
  server = spawn("npm", ["run", "preview", "--", "--port", "4173"], {
    stdio: "ignore",
    detached: true,
  });
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  if (!ready) {
    process.kill(-server.pid, "SIGTERM");
    throw new Error("Preview server did not start. Run npm run build first.");
  }
}
const browser = await chromium.launch(
  existsSync("/Applications/Google Chrome.app") ? { channel: "chrome" } : {},
);
const failures = [];
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
page.on("pageerror", (error) => failures.push(error.message));
page.on("response", (response) => {
  if (
    response.status() >= 400 &&
    new URL(response.url()).origin === new URL(url).origin
  )
    failures.push(`${response.status()} ${response.url()}`);
});
const check = async (name, test) => {
  await test();
  console.log(`✓ ${name}`);
};
try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await check("Home links respect the deployment path", async () => {
    for (const selector of [
      ".brand",
      ".desktop-nav .active",
      ".footer-column .active",
      ".legal span a",
    ]) {
      const href = await page.locator(selector).getAttribute("href");
      assert.equal(new URL(href, page.url()).pathname, new URL(url).pathname);
    }
  });
  await check("Original hero video and local assets load", async () => {
    await page.waitForFunction(
      () => document.querySelector("video").readyState >= 2,
    );
    assert.equal(
      await page.locator("video").evaluate((v) => v.videoWidth / v.videoHeight),
      16 / 9,
    );
    assert.equal(
      await page
        .locator(".hero")
        .evaluate((el) => el.getBoundingClientRect().height),
      810,
    );
  });
  await check("Cookie choice persists across reload", async () => {
    await page.getByRole("button", { name: "Decline", exact: true }).click();
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.locator(".cookie-banner").count(), 0);
  });
  await check(
    "Shop menu opens, navigates locally, and closes with Escape",
    async () => {
      const button = page.getByRole("button", { name: "shop", exact: true });
      await button.click();
      assert.equal(await button.getAttribute("aria-expanded"), "true");
      await page.keyboard.press("Escape");
      assert.equal(await button.getAttribute("aria-expanded"), "false");
      await button.click();
      await page
        .locator(".mega-menu")
        .getByRole("link", { name: "New Arrivals", exact: true })
        .click();
      await page.waitForTimeout(500);
      assert.equal(await page.locator(".mega-menu").count(), 0);
      assert.equal(new URL(page.url()).hash, "#new-arrivals");
    },
  );
  await check("Carousel advances and reverses", async () => {
    const track = page.locator("#new-arrivals .product-track");
    await page
      .getByRole("button", { name: "Next new arrivals", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        document.querySelector("#new-arrivals .product-track").scrollLeft > 100,
    );
    await page
      .getByRole("button", { name: "Previous new arrivals", exact: true })
      .click();
    await page.waitForFunction(
      () =>
        document.querySelector("#new-arrivals .product-track").scrollLeft < 2,
    );
    assert.ok((await track.evaluate((el) => el.scrollLeft)) < 2);
  });
  await check(
    "Product selection, quantity, and persistent cart work",
    async () => {
      await page.locator("#new-arrivals .product-link").first().click();
      await page
        .getByRole("button", { name: "Increase quantity", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Add to cart", exact: true })
        .click();
      assert.equal(await page.locator(".cart-item output").textContent(), "2");
      assert.match(
        await page.locator(".cart-summary").innerText(),
        /\$56\.00 USD/,
      );
      await page.keyboard.press("Escape");
      await page.reload({ waitUntil: "networkidle" });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(250);
      await page
        .getByRole("button", { name: "Your cart, 2 items", exact: true })
        .click();
      assert.equal(await page.locator(".cart-item output").textContent(), "2");
      await page
        .locator(".cart-item")
        .getByRole("button", { name: /Remove one/ })
        .click();
      assert.match(
        await page.locator(".cart-summary").innerText(),
        /\$28\.00 USD/,
      );
      await page
        .getByRole("button", { name: "Check out", exact: true })
        .click();
      await page
        .getByRole("status")
        .filter({ hasText: "Checkout is not connected" })
        .waitFor({ state: "visible" });
      await page.getByRole("button", { name: "Remove", exact: true }).click();
      assert.equal(
        await page.getByRole("heading", { name: "Your cart is empty" }).count(),
        1,
      );
      await page.keyboard.press("Escape");
    },
  );
  await check("Search handles matching and empty results", async () => {
    await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(250);
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page
      .getByRole("searchbox", { name: "Search products" })
      .fill("matcha");
    assert.equal(await page.locator(".search-results>button").count(), 1);
    await page
      .getByRole("searchbox", { name: "Search products" })
      .fill("xyz-no-such-product");
    assert.match(
      await page.locator(".search-results").innerText(),
      /No products found/,
    );
    await page.keyboard.press("Escape");
  });
  await check("Newsletter validation and preview feedback work", async () => {
    await page.locator("#newsletter-email").fill("not-an-email");
    await page.getByRole("button", { name: "Subscribe", exact: true }).click();
    assert.equal(
      await page
        .locator("#newsletter-email")
        .evaluate((el) => el.validity.valid),
      false,
    );
    await page.locator("#newsletter-email").fill("preview@example.com");
    await page.getByRole("button", { name: "Subscribe", exact: true }).click();
    assert.match(
      await page.locator(".newsletter-notice").innerText(),
      /not connected/,
    );
  });
  await check("Reduced motion pauses video", async () => {
    await page
      .getByRole("button", { name: "Accessibility options", exact: true })
      .click();
    await page
      .getByRole("checkbox", { name: "Reduce motion / pause video" })
      .check();
    assert.equal(await page.locator("video").evaluate((el) => el.paused), true);
    await page.keyboard.press("Escape");
  });
  await check(
    "Every image loads and the page fits desktop, tablet, and mobile",
    async () => {
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => {
          for (const img of document.images) img.loading = "eager";
        });
        await page.waitForFunction(() =>
          [...document.images].every(
            (img) => img.complete && img.naturalWidth > 0,
          ),
        );
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `Horizontal overflow at ${width}px`,
        );
      }
    },
  );
  await check(
    "Mobile menu and product dialog work with keyboard dismissal",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
      await page.waitForTimeout(250);
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await page.locator(".mobile-nav summary").click();
      await page
        .locator(".mobile-shop")
        .getByRole("link", { name: "New Arrivals", exact: true })
        .click();
      await page.locator("#new-arrivals .product-link").first().click();
      assert.equal(await page.locator(".product-dialog").isVisible(), true);
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog").count(), 0);
    },
  );
  await fs.mkdir("artifacts", { recursive: true });
  await page.evaluate(() => {
    const v = document.querySelector("video");
    v.pause();
    v.currentTime = 2;
    scrollTo({ top: 0, behavior: "instant" });
  });
  await page.waitForTimeout(300);
  await page.screenshot({
    path: "artifacts/verified-mobile.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "artifacts/verified-desktop.png",
    fullPage: true,
  });
  assert.deepEqual(failures, [], "No browser errors or failed local requests");
  console.log("All browser checks passed.");
} finally {
  await browser.close();
  if (server) process.kill(-server.pid, "SIGTERM");
}
