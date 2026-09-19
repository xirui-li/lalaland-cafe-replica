import assert from "node:assert/strict";
import { chromium } from "playwright";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
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
      if ((await fetch(url)).ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  if (!ready) {
    process.kill(-server.pid, "SIGTERM");
    throw new Error("Preview server did not start. Run npm run build first.");
  }
}
const browser = await chromium.launch(
  existsSync("/Applications/Google Chrome.app") ? { channel: "chrome" } : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
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
const top = async () => {
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(250);
};
try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await check("The original main video and poster are preserved", async () => {
    for (const [file, hash] of [
      [
        "hero.mp4",
        "6bf91d05f5e13a1533af5c0a45f2377fbd54db2ca00d1778f7bda60fe4e723cb",
      ],
      [
        "hero-poster.jpg",
        "412614eaa0bb4eba714fe3d7d6080ed363896ed6c635980ef969c8efa09a9d6c",
      ],
    ])
      assert.equal(
        createHash("sha256")
          .update(await fs.readFile(`public/assets/${file}`))
          .digest("hex"),
        hash,
      );
    await page.waitForFunction(
      () => document.querySelector("video").readyState >= 2,
    );
    const video = await page.locator("video").evaluate((element) => ({
      ratio: element.videoWidth / element.videoHeight,
      autoplay: element.autoplay,
      muted: element.muted,
      loop: element.loop,
      inline: element.playsInline,
      filter: getComputedStyle(element).filter,
    }));
    assert.equal(video.ratio, 16 / 9);
    assert.ok(video.autoplay && video.muted && video.loop && video.inline);
    assert.match(video.filter, /brand-tone/);
    assert.equal(
      await page
        .locator(".hero")
        .evaluate((element) => element.getBoundingClientRect().height),
      810,
    );
  });
  await check(
    "THICK. yogurt branding replaces reference-site copy and links",
    async () => {
      assert.match(await page.title(), /THICK.*Yogurt/);
      const body = await page.locator("body").innerText();
      assert.match(body, /THICK Holdings LLC/);
      assert.match(body, /non-dripping strained yogurt/i);
      assert.doesNotMatch(
        body,
        /La La Land|coffee|café|tumbler|shipping|checkout|Shopify/i,
      );
      assert.equal(
        await page
          .locator(
            'a[href*="lalalandcafe.com"], a[href*="lalalandcares.com"], a[href*="l.ead.me"]',
          )
          .count(),
        0,
      );
      for (const selector of [
        ".brand",
        ".desktop-nav .active",
        ".footer-column .active",
        ".legal span a",
      ]) {
        const href = await page.locator(selector).getAttribute("href");
        assert.equal(new URL(href, page.url()).pathname, new URL(url).pathname);
      }
      for (const href of await page
        .locator('a[href^="#"]')
        .evaluateAll((links) =>
          links.map((link) => link.getAttribute("href")),
        )) {
        assert.equal(
          await page.locator(href).count(),
          1,
          `Anchor ${href} has a target`,
        );
      }
    },
  );
  await check(
    "Yogurt gallery scrolls in both directions and reaches its end",
    async () => {
      assert.equal(await page.locator("#yogurt .product-card").count(), 7);
      const next = page.getByRole("button", {
        name: "Next our yogurt",
        exact: true,
      });
      const previous = page.getByRole("button", {
        name: "Previous our yogurt",
        exact: true,
      });
      await next.click();
      await page.waitForFunction(
        () => document.querySelector("#yogurt .product-track").scrollLeft > 100,
      );
      await page.waitForTimeout(400);
      await previous.click();
      await page.waitForFunction(
        () => document.querySelector("#yogurt .product-track").scrollLeft < 2,
      );
      for (let i = 0; i < 10 && (await next.isEnabled()); i++) {
        await next.click();
        await page.waitForTimeout(500);
      }
      assert.ok(await next.isDisabled());
      assert.ok(await previous.isEnabled());
      await page
        .locator(".product-track")
        .evaluate((element) =>
          element.scrollTo({ left: 0, behavior: "instant" }),
        );
    },
  );
  await check(
    "Yogurt details retain the blue filter and offer the correct store phone",
    async () => {
      const trigger = page.getByRole("button", {
        name: "View yogurt bowl 01",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Yogurt bowl 01",
        exact: true,
      });
      assert.ok(await dialog.isVisible());
      assert.match(await dialog.innerText(), /selection and prices/);
      assert.doesNotMatch(await dialog.innerText(), /\$|Add to cart|Shipping/);
      assert.equal(
        await dialog
          .getByRole("link", { name: "CALL THE STORE" })
          .getAttribute("href"),
        "tel:+17712539358",
      );
      assert.match(
        await dialog
          .locator("img")
          .evaluate((element) => getComputedStyle(element).filter),
        /brand-tone/,
      );
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog").count(), 0);
      assert.ok(
        await trigger.evaluate((element) => element === document.activeElement),
      );
    },
  );
  await check(
    "Yogurt search handles matching, empty results, and image selection",
    async () => {
      await top();
      await page
        .getByRole("button", { name: "Search yogurt", exact: true })
        .click();
      const search = page.getByRole("searchbox", { name: "Search yogurt" });
      await search.fill("banana");
      assert.equal(await page.locator(".search-results > button").count(), 1);
      assert.match(
        await page
          .locator(".search-results img")
          .evaluate((element) => getComputedStyle(element).filter),
        /brand-tone/,
      );
      await page.locator(".search-results > button").click();
      assert.ok(
        await page.getByRole("dialog", { name: "Yogurt bowl 02" }).isVisible(),
      );
      await page.keyboard.press("Escape");
      await top();
      await page
        .getByRole("button", { name: "Search yogurt", exact: true })
        .click();
      await search.fill("coffee");
      assert.equal(await page.locator(".search-results > button").count(), 0);
      assert.match(
        await page.locator(".search-results").innerText(),
        /No yogurt bowls found/,
      );
      await page.keyboard.press("Escape");
    },
  );
  await check(
    "One store has the confirmed address, hours, phone, and map destination",
    async () => {
      const store = page.locator("#our-store");
      assert.equal(await store.count(), 1);
      const content = await store.innerText();
      assert.match(content, /1073 Wisconsin Ave NW, 1st Floor/);
      assert.match(content, /Washington, DC 20007/);
      assert.match(content, /Every day\s+11:30 AM – 10:30 PM/);
      assert.match(content, /\(771\) 253-9358/);
      const map = new URL(
        await store
          .getByRole("link", { name: "GET DIRECTIONS" })
          .getAttribute("href"),
      );
      assert.equal(
        map.searchParams.get("query"),
        "1073 Wisconsin Ave NW, 1st Floor, Washington, DC 20007",
      );
    },
  );
  await check(
    "Accessibility controls pause video and support larger text",
    async () => {
      await page
        .getByRole("button", { name: "Accessibility options", exact: true })
        .click();
      await page
        .getByRole("checkbox", { name: "Reduce motion / pause video" })
        .check();
      assert.ok(
        await page.locator("video").evaluate((element) => element.paused),
      );
      await page.getByRole("checkbox", { name: "Larger text" }).check();
      await page.keyboard.press("Escape");
      assert.ok(
        await page
          .locator(".site")
          .evaluate((element) => element.classList.contains("large-text")),
      );
    },
  );
  await check(
    "All images load and layouts fit desktop, tablet, and mobile",
    async () => {
      for (const width of [1440, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.evaluate(() => {
          for (const image of document.images) image.loading = "eager";
        });
        await page.waitForFunction(() =>
          [...document.images].every(
            (image) => image.complete && image.naturalWidth > 0,
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
    "Mobile menu links close the dialog and reach the store",
    async () => {
      await page.setViewportSize({ width: 390, height: 844 });
      await top();
      await page
        .getByRole("button", { name: "Open menu", exact: true })
        .click();
      await page
        .locator(".mobile-nav")
        .getByRole("link", { name: "our store", exact: true })
        .click();
      assert.equal(new URL(page.url()).hash, "#our-store");
      assert.equal(await page.locator("dialog").count(), 0);
      await page.waitForFunction(
        () =>
          Math.abs(
            document.querySelector("#our-store").getBoundingClientRect().top -
              100,
          ) < 5,
      );
      await page.locator("#yogurt .product-link").first().click();
      assert.ok(await page.locator(".product-dialog").isVisible());
      await page.keyboard.press("Escape");
      assert.equal(await page.locator("dialog").count(), 0);
    },
  );
  await page
    .getByRole("button", { name: "Accessibility options", exact: true })
    .click();
  await page.getByRole("checkbox", { name: "Larger text" }).uncheck();
  await page.keyboard.press("Escape");
  await fs.mkdir("artifacts", { recursive: true });
  await page.evaluate(() => {
    const video = document.querySelector("video");
    video.pause();
    video.currentTime = 2;
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
  assert.deepEqual(failures, [], "No browser errors or failed requests");
  console.log("All browser checks passed.");
} finally {
  await browser.close();
  if (server) process.kill(-server.pid, "SIGTERM");
}
