import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page), "No runtime or hydration errors").toEqual([]);
});

test("renders the branded login on both routes", async ({ page }) => {
  for (const route of ["/", "/login"]) {
    await page.goto(route);
    await expect(page).toHaveTitle("Login | Everon FireBOT");
    await expect(
      page.getByRole("heading", { name: "Hello! Welcome to FireBOT" }),
    ).toBeVisible();
    const logo = page.getByRole("img", { name: "Everon" });
    await expect(logo).toBeVisible();
    await expect(logo).toHaveJSProperty("naturalWidth", 682);
    await expect(page.getByLabel("Remember me")).toBeChecked();
    await expect(page.getByRole("region", { name: "Login" })).toHaveCSS("width", "400px");
    const inputBounds = await page.getByLabel("User Name/Email").boundingBox();
    expect(inputBounds?.height).toBeGreaterThanOrEqual(32);
  }
});

test("validates required fields and opens the demo project without storing credentials", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByText("Enter your user name or email.")).toBeVisible();
  await expect(page.getByText("Enter your password.", { exact: true })).toBeVisible();
  await expect(page.getByLabel("User Name/Email")).toBeFocused();
  await page.getByLabel("User Name/Email").fill("firebot.user");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page.getByLabel(/^Password/)).toBeFocused();
  await page.getByLabel(/^Password/).fill("example-test-password");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL("/projects/new");
  await expect(page.getByRole("heading", { name: "Project Setup" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});

test("supports visibility, remember me, and the SSO action", async ({ page }) => {
  await page.goto("/");
  const password = page.getByLabel(/^Password/);
  await password.fill("example-test-password");
  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await page.getByLabel("Remember me").uncheck();
  await expect(page.getByLabel("Remember me")).not.toBeChecked();
  await page.getByRole("button", { name: "Sign in with Company Single Sign-On" }).click();
  await expect(page.getByRole("status")).toContainText("Single Sign-On is not configured yet");
});

test("fits narrow mobile screens without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Login", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in with Company Single Sign-On" })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
  ).toBe(true);
});

test("tolerates root attributes and password manager input decorations", async ({ page, request }) => {
  await page.addInitScript(() => {
    const decorateInputs = () => {
      document.documentElement?.setAttribute(
        "data-rdwebrtc-ext-url",
        "chrome-extension://test-extension/",
      );
      document.querySelectorAll("input:not([data-keeper-lock-id])").forEach((input, index) => {
        input.setAttribute("data-keeper-lock-id", `keeper-test-${index}`);
        const decoration = document.createElement("keeper-lock");
        decoration.hidden = true;
        input.after(decoration);
      });
    };
    new MutationObserver(decorateInputs).observe(document, {
      childList: true,
      subtree: true,
    });
  });

  for (const route of ["/", "/login"]) {
    const response = await request.get(route);
    expect(await response.text()).not.toMatch(/<input\b/);
    await page.goto(route);
    await expect(page.locator("html")).toHaveAttribute(
      "data-rdwebrtc-ext-url",
      "chrome-extension://test-extension/",
    );
    await expect(page.getByLabel("User Name/Email")).toHaveAttribute(
      "data-keeper-lock-id",
      /keeper-test-/,
    );
    await page.getByLabel("User Name/Email").fill("firebot.user");
    await page.getByLabel(/^Password/).fill("example-test-password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(page.getByLabel(/^Password/)).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: "Login", exact: true }).click();
    await expect(page).toHaveURL("/projects/new");
    await expect(page.getByRole("heading", { name: "Project Setup" })).toBeVisible();
  }
});

test("edits dummy project data and prepares a setup summary", async ({ page }) => {
  await page.goto("/projects/new");
  await page.getByLabel("Project/Design Name").fill("Demo Office");
  await page.getByLabel("IBC Occupancy").selectOption("Educational (Group E)");
  await page.getByLabel("NFPA 72 Edition").selectOption("NFPA 72 - 2025");
  await page.getByRole("radiogroup", { name: "Is this building Sprinkler?" })
    .getByLabel("No", { exact: true }).check();
  await page.getByRole("button", { name: "Detect with AI" }).click();
  await expect(page.getByRole("status")).toContainText("Sample scale applied");
  await page.getByRole("button", { name: "Calibrate by Door" }).click();
  await page.getByRole("button", { name: "Apply sample calibration" }).click();
  await page.getByRole("button", { name: "Prepare Floor Plan" }).click();
  const dialog = page.getByRole("dialog", { name: "Floor plan setup summary" });
  await expect(dialog).toContainText("Demo Office");
  await expect(dialog).toContainText("Educational (Group E)");
  await expect(dialog).toContainText("NFPA 72 - 2025");
  await expect(dialog).toContainText("No / Yes");
  await page.getByRole("button", { name: "Back to setup" }).click();
  await page.getByRole("link", { name: "Exit demo" }).click();
  await expect(page).toHaveURL("/login");
});

test("validates plan files and does not claim to analyze user uploads", async ({ page }) => {
  await page.goto("/projects/new");
  const upload = page.getByLabel("Upload floor plan", { exact: true });
  await upload.setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("test") });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Choose a PDF");
  await page.getByRole("button", { name: "Prepare Floor Plan" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await upload.setInputFiles({ name: "large.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(10 * 1024 * 1024 + 1) });
  await expect(page.getByRole("main").getByRole("alert")).toContainText("no larger than 10 MB");
  await upload.setInputFiles({ name: "office.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 dummy") });
  await expect(page.getByRole("main").getByRole("alert")).not.toBeVisible();
  await page.getByRole("button", { name: "Detect with AI" }).click();
  await expect(page.getByRole("status")).toContainText("AI detection is not connected");
  await page.getByRole("button", { name: "Prepare Floor Plan" }).click();
  await expect(page.getByRole("dialog")).toContainText("office.pdf");
});

test("project form requires a scale and fits mobile screens", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/projects/new");
  await page.getByLabel("Architectural Scale").selectOption("");
  await page.getByRole("button", { name: "Prepare Floor Plan" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(page.getByLabel("Architectural Scale")).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("opens a separate settings widget after login and preserves its draft on reopen", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("User Name/Email").fill("demo@everon.com");
  await page.getByLabel(/^Password/).fill("demo123");
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL("/projects/new");
  const settings = page.getByRole("button", { name: "Settings", exact: true });
  await expect(settings).toHaveAttribute("aria-expanded", "false");
  await settings.click();
  const widget = page.getByRole("dialog", { name: "Configure", exact: true });
  await expect(widget.getByRole("heading", { name: "System & Project Setup" })).toBeVisible();
  await widget.getByLabel("Project/Design Name").fill("Widget test project");
  await widget.getByLabel("IBC Occupancy").selectOption("Educational (Group E)");
  await widget.getByRole("button", { name: "Detect with AI" }).click();
  await expect(widget.getByRole("status")).toContainText("Sample scale applied");
  await widget.getByRole("button", { name: "Calibrate by Door" }).click();
  await page.getByRole("button", { name: "Apply sample calibration" }).click();
  await widget.getByRole("button", { name: "Prepare Floor Plan" }).click();
  const summary = page.getByRole("dialog", { name: "Floor plan setup summary" });
  await expect(summary).toContainText("Widget test project");
  await expect(summary).toContainText("Educational (Group E)");
  await summary.getByRole("button", { name: "Back to setup" }).click();
  await widget.getByRole("button", { name: "Close settings" }).click();
  await expect(widget).not.toBeVisible();
  await expect(settings).toBeFocused();
  await expect(page.getByRole("main").getByLabel("Project/Design Name"))
    .toHaveValue("Emerald House - Fire System Design");
  await settings.click();
  await expect(widget.getByLabel("Project/Design Name")).toHaveValue("Widget test project");
  await page.keyboard.press("Escape");
  await expect(widget).not.toBeVisible();
  await expect(settings).toBeFocused();
});

test("settings widget validates uploads and fits a narrow mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/projects/new");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const widget = page.getByRole("dialog", { name: "Configure", exact: true });
  await widget.getByLabel("Upload floor plan", { exact: true }).setInputFiles({
    name: "invalid.txt", mimeType: "text/plain", buffer: Buffer.from("test"),
  });
  await expect(widget.getByRole("alert")).toContainText("Choose a PDF");
  await widget.getByRole("button", { name: "Prepare Floor Plan" }).click();
  await expect(page.getByRole("dialog", { name: "Floor plan setup summary" })).not.toBeVisible();
  await widget.getByLabel("Upload floor plan", { exact: true }).setInputFiles({
    name: "widget.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4 test"),
  });
  await widget.getByRole("button", { name: "Detect with AI" }).click();
  await expect(widget.getByRole("status")).toContainText("AI detection is not connected");
  await widget.getByLabel("Architectural Scale").selectOption("");
  await widget.getByRole("button", { name: "Prepare Floor Plan" }).click();
  await expect(widget.getByLabel("Architectural Scale")).toBeFocused();
  expect(await widget.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await widget.getByRole("button", { name: "Close settings" }).click();
  await expect(widget).not.toBeVisible();
});
