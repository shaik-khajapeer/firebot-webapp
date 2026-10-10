# Everon FireBOT

A responsive login screen built with Next.js App Router, TypeScript, and Material UI. The navy background, Everon wordmark, white login card, and blue actions follow the supplied screenshot. Both `/` and `/login` render the login screen.

## Run locally

From the outer workspace folder:

```powershell
cd .\firebot-webapp
npm install
npm run dev
```

Open http://localhost:3000.

## Commands

Run these from the application folder:

```powershell
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser tests start a development server on port 3100. Stop the regular development server before running them, since Next.js allows only one development server per application directory.

## Implementation

- `src/app/page.tsx`: server-rendered branding and a client-only login form boundary.
- `src/app/login-form.tsx`: required-field validation, password visibility, remember-me selection, and SSO action.
- `src/app/providers.tsx`: Material UI theme; the layout uses the App Router Emotion cache integration.
- `src/app/page.module.css`: screenshot-inspired desktop layout and responsive mobile styles.
- `public/everon-logo-white.png`: official white Everon logo downloaded from https://www.everonsolutions.com/themes/custom/everon/images/everon-logo-white.png.

This is a frontend demo, not a working authentication service. Enter any non-empty user name and password to open `/projects/new`. Credentials are not sent or stored, and the project route is intentionally public. SSO still displays a configuration notice. Remember me is a form selection only, with no persistence until a backend is connected. Connect a server-side authentication service and your organization's identity provider before production use. Never store passwords in browser storage.

## Project setup demo

`src/app/projects/new/` implements the screenshot-inspired project setup screen with dummy project details, editable occupancy and NFPA edition dropdowns, panel and brand selections, sprinkler and voice evacuation choices, and architectural scales. Form state is tab-local and resets on reload.

The sample plan is a dummy filename, not a real document. You can select a local PDF, PNG, JPG, DWG, or DXF up to 10 MB; it stays in memory and is never uploaded or parsed. File checks validate extension and size only. Detect with AI and door calibration apply explicitly labeled sample values only to the dummy plan, not user uploads. Prepare Floor Plan opens a summary of your selections; no real AI processing, calibrated measurements, or fire-safety design is produced.

### Settings widget

After login, click the **Settings** icon and text in the top-right header to open a right-side Configure drawer. `project-settings-widget.tsx` is the standalone widget; it reuses `ProjectForm` in compact mode to match the supplied System & Project Setup reference. The widget includes the same upload validation, sample scale actions, and setup summary as the main form. Its independent demo values survive closing and reopening the drawer but reset when leaving or reloading the page; they do not change the main project form. Close it with the close button, Escape, or the backdrop.

## Browser extension compatibility

The root `<html>` tolerates attribute-only hydration differences introduced by browser extensions, such as `data-rdwebrtc-ext-url`. This suppression is limited to the root element; descendant hydration errors are not suppressed. The login form mounts on the client after hydration so password managers such as Keeper cannot insert elements into server-rendered input markup before React hydrates it. Branding remains server-rendered, and a loading card is displayed until the form is ready. JavaScript is required to sign in.
