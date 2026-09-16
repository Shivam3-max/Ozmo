import { test, expect, type Page } from "@playwright/test";
import { env, findFreeSlot, runId, runIp, uniquePhone } from "./helpers";

/**
 * The clinic's core journey, in a real browser:
 * a visitor books → staff convert the lead → build and publish a plan from a
 * template → invite the client → the client sets a password, ticks a meal
 * and downloads their data.
 */
test.describe.configure({ mode: "serial" });

const visitor = { name: `Riya E2E ${runId}`, phone: uniquePhone(3), email: `riya-${runId}@example.test` };
// No run id in the password: it is also in the name, and the policy rejects passwords containing your name.
const clientPassword = "mango season window south";
let inviteUrl = "";

async function staffSignIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(env("E2E_DIETITIAN_EMAIL"));
  await page.getByLabel("Password").fill(env("E2E_DIETITIAN_PASSWORD"));
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test.use({ extraHTTPHeaders: { "X-Forwarded-For": runIp } });

test("a visitor books a consultation", async ({ page, request }) => {
  const slot = await findFreeSlot(request);
  await page.goto("/book");

  const dayLabel = new Date(`${slot.date}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  await page.getByRole("button", { name: dayLabel, exact: true }).click();
  const time = page.getByRole("button", { name: slot.time, exact: true });
  await expect(time).toBeEnabled();
  await time.click();

  await page.getByLabel("Name", { exact: true }).fill(visitor.name);
  await page.getByLabel("Phone", { exact: true }).fill(visitor.phone);
  await page.getByLabel("Email", { exact: true }).fill(visitor.email);
  await page.getByLabel("Main reason for consultation").selectOption("Weight loss");
  for (const box of await page.getByRole("checkbox").all()) await box.check();
  await page.getByRole("button", { name: /Confirm booking/ }).click();

  await expect(page.getByRole("heading", { name: "You’re booked." })).toBeVisible();
});

test("the dietitian converts the lead and publishes a plan", async ({ page }) => {
  await staffSignIn(page);

  await page.goto(`/admin/leads?q=${encodeURIComponent(visitor.name)}`);
  await page.getByRole("link", { name: visitor.name }).click();
  await expect(page.getByRole("heading", { name: visitor.name })).toBeVisible();
  await page.getByRole("button", { name: "Convert to client" }).click();
  await expect(page).toHaveURL(/\/admin\/clients\/[a-z0-9]+$/);

  // The booked consultation followed the lead onto the client's file.
  await expect(page.getByText(/Initial · in clinic/)).toBeVisible();

  await page.getByRole("button", { name: "Start a plan" }).click();
  await page.getByRole("button", { name: /Type 2 Diabetes — 7 Day Rotation \(Vegetarian\)/ }).click();
  await expect(page).toHaveURL(/\/admin\/plans\/[a-z0-9]+$/);
  await page.getByRole("button", { name: "Publish to client" }).click();
  await expect(page.getByText(/Published\. The client now sees this version/)).toBeVisible();
  await expect(page.getByText("This version is published.")).toBeVisible();

  await page.getByRole("link", { name: new RegExp(`← ${visitor.name}`) }).click();
  await page.getByRole("button", { name: "Create portal invite" }).click();
  const link = page.locator('input[readonly][value*="/portal/setup/"]');
  await expect(link).toBeVisible();
  inviteUrl = new URL((await link.inputValue())).pathname;
});

test("the client sets a password, logs a meal and downloads their data", async ({ browser }) => {
  expect(inviteUrl, "invite link from the previous step").not.toBe("");
  const context = await browser.newContext({ extraHTTPHeaders: { "X-Forwarded-For": runIp } });
  const page = await context.newPage();

  await page.goto(inviteUrl);
  await expect(page.getByRole("heading", { name: /Welcome, Riya/ })).toBeVisible();
  await page.getByLabel("Password", { exact: true }).fill(clientPassword);
  await page.getByLabel("Confirm password").fill(clientPassword);
  await page.getByRole("button", { name: "Open my dashboard" }).click();
  await expect(page).toHaveURL(/\/portal$/);
  await expect(page.getByText(/Just started/)).toBeVisible();

  const hadThis = page.getByRole("button", { name: "Had this" }).first();
  // The button flips optimistically, so wait for the save itself before exporting.
  const saved = page.waitForResponse((r) => r.url().endsWith("/api/portal/log") && r.request().method() === "POST");
  await hadThis.click();
  expect((await saved).ok()).toBe(true);
  await expect(page.getByRole("button", { name: "Undo" }).first()).toBeVisible();

  const exported = await page.request.get("/api/portal/export");
  expect(exported.status()).toBe(200);
  const data = await exported.json();
  expect(data.about.name).toBe(visitor.name);
  expect(data.plans.every((p: { status: string }) => p.status !== "DRAFT")).toBe(true);
  expect(data.foodLogs.length).toBeGreaterThan(0);

  await context.close();
});

test("the assessment opens with its first question visible on a phone", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto("/assessment");
  await page.getByRole("button", { name: /Start/ }).click();
  const question = page.getByRole("heading", { name: "What should we call you?" });
  await expect(question).toBeInViewport();
  const headerBottom = await page.locator("header").first().evaluate((el) => el.getBoundingClientRect().bottom);
  const questionTop = await question.evaluate((el) => el.getBoundingClientRect().top);
  expect(questionTop).toBeGreaterThan(headerBottom);
  await context.close();
});
