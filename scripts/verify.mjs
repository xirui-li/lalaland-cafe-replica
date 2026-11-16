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
  await check("Soft opening announcement greets visitors and can be dismissed", async () => {
    const dialog = page.getByRole("dialog", { name: "THICK. soft opening" });
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /Soft opening/i);
    assert.match(await dialog.innerText(), /Now – Nov 20 · 11:30 AM – 8:00 PM/);
    const slides = dialog.locator(".soft-opening-slide img");
    assert.equal(await slides.count(), 2);
    await page.waitForFunction(() =>
      [...document.querySelectorAll(".soft-opening-slide img")].every((img) => img.complete && img.naturalWidth > 0),
    );
    const track = dialog.locator(".soft-opening-track");
    await dialog.getByRole("button", { name: "Next poster" }).click();
    await page.waitForFunction(() => {
      const el = document.querySelector(".soft-opening-track");
      return Math.abs(el.scrollLeft - el.clientWidth) < 2;
    });
    assert.equal(await dialog.getByRole("button", { name: "Show poster 2" }).getAttribute("aria-current"), "true");
    await page.screenshot({ path: "artifacts/soft-opening-hours-1440.png" });
    await dialog.getByRole("button", { name: "Show poster 1" }).click();
    await page.waitForFunction(() => document.querySelector(".soft-opening-track").scrollLeft < 2);
    assert.ok(await track.isVisible());
    await page.screenshot({ path: "artifacts/soft-opening-1440.png" });
    await dialog.getByRole("button", { name: "Enter site" }).click();
    await dialog.waitFor({ state: "detached" });
    await page.reload({ waitUntil: "networkidle" });
    assert.equal(await page.getByRole("dialog", { name: "THICK. soft opening" }).count(), 0);
  });
  await check("The THICK. brand film and poster are in place", async () => {
    for (const [file, hash] of [
      [
        "hero.mp4",
        "32d694be19d33be5c1956d21131406a319fac47f8d6948c53666747038bf8079",
      ],
      [
        "hero-poster.jpg",
        "6b38e9c5e727367ba9659f3017af0bc7011d422838613dd2a076637905a91417",
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
    assert.ok(Math.abs(video.ratio - 864 / 496) < .01);
    assert.ok(video.autoplay && video.muted && video.loop && video.inline);
    assert.equal(video.filter, "none");
    const hero = await page.locator(".hero").boundingBox();
    assert.ok(Math.abs(hero.width / hero.height - 16 / 9) < .02);
    await page.getByRole("button", { name: "Pause brand film", exact: true }).click();
    assert.ok(await page.locator("video").evaluate((element) => element.paused));
    await page.getByRole("button", { name: "Play brand film", exact: true }).click();
    assert.ok(await page.locator("video").evaluate((element) => !element.paused));
  });
  await check("The website contains no Chinese text", async () => {
    const text = await page.evaluate(() => document.documentElement.outerHTML);
    assert.doesNotMatch(text, /[\u3400-\u9fff\uff00-\uffef]/);
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
  await check("Featured bowls open details and Bao responds to touch", async () => {
    assert.equal(await page.locator(".featured-card").count(), 3);
    await page.locator(".featured-image").first().click();
    assert.ok(await page.getByRole("dialog", { name: "OG", exact: true }).isVisible());
    await page.keyboard.press("Escape");
    const bao = page.getByRole("button", { name: "Say hello to Bao", exact: true });
    await bao.click();
    assert.equal(await bao.getAttribute("aria-pressed"), "true");
    assert.match(await page.locator(".bao-bubble").innerText(), /hi, spoon friend/);
    await bao.click();
    assert.equal(await bao.getAttribute("aria-pressed"), "false");
  });
  await check(
    "Soft opening menu shows every series with tabs",
    async () => {
      const menu = page.locator("#yogurt");
      assert.match(await menu.locator("h2").innerText(), /Soft Opening Menu/i);
      const tabs = menu.getByRole("tab");
      assert.deepEqual(
        (await tabs.allInnerTexts()).map((text) => text.replace(/\s*\d+$/, "")),
        ["REMIX", "SWIRL", "DOME", "BULK", "LOADED", "SPHERE", "LIMITED"],
      );
      assert.equal(await menu.locator(".menu-card").count(), 9);
      let total = 0;
      for (const [name, count] of [["Remix", 9], ["Swirl", 6], ["Dome", 5], ["Bulk", 6], ["Loaded", 6], ["Sphere", 1], ["Limited", 2]]) {
        await menu.getByRole("tab", { name: new RegExp(`^${name}`, "i") }).click();
        assert.equal(await menu.getByRole("tab", { selected: true }).getAttribute("id"), `tab-${name.toLowerCase()}`);
        assert.equal(await menu.locator(".menu-card").count(), count);
        await page.waitForFunction(() =>
          [...document.querySelectorAll("#yogurt .menu-card img")].every((image) => {
            image.loading = "eager";
            return image.complete && image.naturalWidth > 0;
          }),
        );
        total += count;
      }
      assert.equal(total, 35);
      assert.match(await menu.innerText(), /Mango Boat[\s\S]*\$13\.99/);
      await menu.getByRole("tab", { name: /^Bulk/i }).click();
      assert.match(await menu.innerText(), /Earth Bowl/);
      await menu.getByRole("tab", { name: /^Remix/i }).click();
    },
  );
  await check(
    "Yogurt details use original colors and offer the correct store phone",
    async () => {
      const trigger = page.getByRole("button", {
        name: "View Caramel Cloud",
        exact: true,
      });
      await trigger.click();
      const dialog = page.getByRole("dialog", {
        name: "Caramel Cloud",
        exact: true,
      });
      assert.ok(await dialog.isVisible());
      assert.match(await dialog.innerText(), /THICK\. \/ REMIX/);
      assert.match(await dialog.innerText(), /today’s prices/);
      assert.doesNotMatch(await dialog.innerText(), /\$|Add to cart|Shipping/);
      assert.equal(
        await dialog
          .getByRole("link", { name: "CALL THE STORE" })
          .getAttribute("href"),
        "tel:+17712539358",
      );
      assert.equal(
        await dialog
          .locator("img")
          .evaluate((element) => getComputedStyle(element).filter),
        "none",
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
      await search.fill("lychee");
      assert.equal(await page.locator(".search-results > button").count(), 1);
      assert.equal(
        await page
          .locator(".search-results img")
          .evaluate((element) => getComputedStyle(element).filter),
        "none",
      );
      await page.locator(".search-results > button").click();
      assert.ok(
        await page.getByRole("dialog", { name: "Mango Pomelo Sago" }).isVisible(),
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
        /Nothing on the menu matches/,
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
      assert.match(content, /Every day\s+11:30 AM – 10:00 PM\s*Soft opening through Nov 20: 11:30 AM – 8:00 PM/);
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
      await page.locator("#yogurt .menu-card-link").first().click();
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
  await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.waitForTimeout(500);
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
