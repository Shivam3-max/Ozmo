import { test, expect, type Page } from "@playwright/test";
import { env, runIp } from "./helpers";

/**
 * Browser behaviour that API tests can't see: form errors a visitor can act on,
 * keyboard access to the site menus, and layouts that hold at tablet and
 * large-desktop widths.
 */
test.use({ extraHTTPHeaders: { "X-Forwarded-For": runIp } });

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test("contact form explains a phone number the server would reject, and focuses it", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("UI Test");
  await page.getByLabel("Phone", { exact: true }).fill("12345");
  await page.getByLabel("What’s this about?").selectOption("Something else");
  await page.getByLabel("Message").fill("Checking the error message.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send message" }).click();

  const phone = page.getByLabel("Phone", { exact: true });
  await expect(page.getByText("Please enter a valid phone number")).toBeVisible();
  await expect(phone).toHaveAttribute("aria-invalid", "true");
  await expect(phone).toBeFocused();
  await expect(page.locator("main form [role=alert]")).toHaveText("Please check your phone number.");

  // Fixing the field clears its error.
  await phone.fill("98888 12345");
  await expect(phone).not.toHaveAttribute("aria-invalid", "true");
});

test.describe("site menu from the keyboard", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("opens with Enter, panel links follow the button, Escape returns focus", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Programmes" });
    await trigger.focus();
    await expect(trigger).toHaveAttribute("aria-expanded", "false"); // focus alone doesn't open it

    await page.keyboard.press("Enter");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Tab");
    await expect(page.locator("#menu-programs a").first()).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(trigger).toBeFocused();
  });

  test("closes when focus moves past the menu", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Conditions" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#menu-conditions")).toBeVisible();
    const links = await page.locator("#menu-conditions a").count();
    for (let i = 0; i <= links; i++) await page.keyboard.press("Tab");
    await expect(page.locator("#menu-conditions")).toHaveCount(0);
  });
});

for (const viewport of [{ width: 768, height: 1024 }, { width: 1920, height: 1080 }]) {
  test.describe(`layouts at ${viewport.width}px`, () => {
    test.use({ viewport });

    test("public pages don't scroll sideways", async ({ page }) => {
      for (const path of ["/", "/programs", "/conditions/pcos", "/book", "/assessment", "/contact", "/privacy-policy"]) {
        await page.goto(path);
        expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
      }
    });

    test("practice pages don't scroll sideways", async ({ page }) => {
      await page.goto("/admin/login");
      await page.getByLabel("Email").fill(env("E2E_DIETITIAN_EMAIL"));
      await page.getByLabel("Password").fill(env("E2E_DIETITIAN_PASSWORD"));
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/admin$/);
      for (const path of ["/admin", "/admin/leads", "/admin/clients", "/admin/appointments", "/admin/enquiries", "/admin/plans", "/admin/foods", "/admin/messages", "/admin/account"]) {
        await page.goto(path);
        expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0);
      }
      // Detail pages carry the longest free text people type (notes, messages, reasons).
      for (const [list, pattern] of [["/admin/leads", /^\/admin\/leads\/c/], ["/admin/clients", /^\/admin\/clients\/c/]] as const) {
        await page.goto(list);
        const hrefs = await page.locator("main a[href]").evaluateAll((as) => as.map((a) => a.getAttribute("href") ?? ""));
        const detail = hrefs.find((h) => pattern.test(h));
        if (!detail) continue;
        await page.goto(detail);
        expect(await horizontalOverflow(page), detail).toBeLessThanOrEqual(0);
      }
      await page.goto("/admin/account");
      await expect(page.getByRole("button", { name: "Sign out everywhere" })).toBeVisible();
    });
  });
}
