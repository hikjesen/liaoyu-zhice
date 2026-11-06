import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
test.beforeEach(async ({ page }) => {
  await page.route("https://**/*", (r) => r.abort());
});
test("full offline assessment, scenarios, persistence and report export", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await mkdir("test-results/screenshots", { recursive: true });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "读懂海况，让养殖决策有据可依。" }),
  ).toBeVisible();
  await expect(page.locator(".metric-card")).toHaveCount(4);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/01-overview.png",
    fullPage: true,
  });
  await page.locator('nav a[href="#/evaluation"]').click();
  await expect(page.getByTestId("pending-count")).toHaveText("4");
  await page.getByRole("button", { name: "载入基准情景", exact: true }).click();
  await expect(page.getByTestId("pass-count")).toHaveText("4");
  await page.getByRole("button", { name: "载入高温情景", exact: true }).click();
  await expect(page.getByTestId("outside-count")).toHaveText("1");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/02-evaluation.png",
    fullPage: true,
  });
  await page.locator('nav a[href="#/scenarios"]').click();
  await page.getByRole("button", { name: "基准情景", exact: true }).click();
  await page.getByRole("textbox", { name: "情景名称" }).fill("基准方案");
  await page.getByRole("button", { name: "保存当前情景" }).click();
  await page.getByRole("button", { name: "高温情景", exact: true }).click();
  await page.getByRole("textbox", { name: "情景名称" }).fill("高温方案");
  await page.getByRole("button", { name: "保存当前情景" }).click();
  await expect(page.locator(".scenario-table tbody tr")).toHaveCount(2);
  await page.reload();
  await expect(page.locator(".scenario-table tbody tr")).toHaveCount(2);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/03-scenarios.png",
    fullPage: true,
  });
  await page.locator('nav a[href="#/reports"]').click();
  await expect(
    page.getByRole("heading", { name: "养殖环境参考评估报告" }),
  ).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "导出 JSON", exact: true }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const report = JSON.parse(await readFile(path!, "utf8"));
  expect(report.assessment.outside).toBe(1);
  expect(report.scenarios).toHaveLength(2);
  expect(report.marine.kind).toBe("model-forecast-snapshot");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/04-report.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "test-results/sample-report.pdf",
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/05-print-layout.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("network failure leaves the usable built-in snapshot intact", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "更新海况", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("更新未成功");
  await expect(page.locator(".metric-card")).toHaveCount(4);
  await expect(page.locator(".top-actions")).toContainText("离线快照");
});
test("390px mobile view has working navigation and no horizontal body overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: "test-results/screenshots/06-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("link", { name: /养殖条件评估/ })
    .first()
    .click();
  await expect(page.getByTestId("pending-count")).toHaveText("4");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test("marine references stay pending and inputs can be cleared", async ({
  page,
}) => {
  await page.goto("/#/evaluation");
  await page.getByRole("button", { name: "填入海面参考值" }).click();
  await expect(page.getByTestId("pending-count")).toHaveText("4");
  await expect(page.getByTestId("pass-count")).toHaveText("0");
  await page.getByRole("button", { name: "载入基准情景", exact: true }).click();
  await expect(page.getByTestId("pass-count")).toHaveText("4");
  await page.getByRole("button", { name: "清空参数", exact: true }).click();
  await expect(page.getByTestId("pending-count")).toHaveText("4");
});
test("manual edits and report import recompute instead of trusting supplied results", async ({
  page,
}) => {
  await page.goto("/#/evaluation");
  await page.getByRole("button", { name: "载入基准情景", exact: true }).click();
  const temperature = page.locator("#temperature");
  await temperature.fill("25");
  await temperature.blur();
  await expect(page.getByTestId("outside-count")).toHaveText("1");
  const inputs = {
    temperature: { value: 18, origin: "scenario" },
    salinity: { value: 31, origin: "scenario" },
    depth: { value: 22, origin: "scenario" },
    meanCurrent: { value: 12, origin: "scenario" },
  };
  const report = { schemaVersion: 1, inputs, assessment: { outside: 99 } };
  await page.locator("input[type=file]").setInputFiles({
    name: "report.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(report)),
  });
  await expect(page.getByTestId("pass-count")).toHaveText("4");
  await expect(page.getByTestId("outside-count")).toHaveText("0");
  await page.locator("input[type=file]").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad json"),
  });
  await expect(page.getByTestId("pass-count")).toHaveText("4");
});
test("successful API refresh followed by failure retains last successful provenance", async ({
  page,
}) => {
  const snapshot = JSON.parse(
    await readFile("src/data/snapshots/changhai-demo.json", "utf8"),
  );
  await page.route("https://marine-api.open-meteo.com/**", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(snapshot.raw),
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "更新海况", exact: true }).click();
  await expect(page.locator(".top-actions")).toContainText("在线模型");
  await page.unroute("https://marine-api.open-meteo.com/**");
  await page.getByRole("button", { name: "更新海况", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("上次成功数据");
  await expect(page.locator(".top-actions")).toContainText("在线模型");
});
