# PWA Installability Investigation

This document outlines the investigation and steps taken to resolve the "currently uninstallable" issue for the Quran Study App when deployed on Netlify/Vercel, specifically on Android Chrome.

## 1. Problem Definition

The application is not installable as a PWA on Android devices when deployed. Instead of a proper "Install" prompt, users see a "currently uninstallable" message and are offered to "Add to Home Screen" as a simple bookmark.

## 2. Initial Findings & Hypothesis

- The issue does not occur during local development (`npm run dev`).
- The issue appears only on deployed environments (Netlify, Vercel).
- This strongly suggests a configuration problem related to how assets and the manifest are handled during the build and deployment process. The most likely causes are incorrect paths in the `manifest.json` or a misconfigured service worker.

## 3. Research & Checklist for PWA Installability on Android Chrome

Based on the research from MDN, web.dev, and `vite-plugin-pwa` documentation, the following criteria are essential for a PWA to be installable on Android Chrome.

**PWA Checklist:**
- [x] **Served over HTTPS:** Netlify provides this by default.
- [ ] **Includes a valid Web App Manifest:** This is the core of the issue. We need to ensure it's generated correctly.
- [ ] **Manifest has `short_name` or `name`:** Must be present.
- [ ] **Manifest has a `start_url`:** Must be a valid, relative URL.
- [ ] **Manifest has `icons`:** Must include at least a 192x192 and a 512x512 icon.
- [ ] **Manifest has `display` set to `standalone`, `fullscreen`, or `minimal-ui`:** `standalone` is appropriate here.
- [ ] **Manifest icon paths are correct:** Paths must be relative to the manifest file itself so they resolve correctly after deployment. Using absolute paths like `/icon.png` is a common source of failure.
- [ ] **A service worker is registered:** `vite-plugin-pwa` handles this.
- [ ] **The service worker has a `fetch` event handler:** This is required for offline capabilities. The default `vite-plugin-pwa` configuration (`generateSW`) includes this.

**Conclusion from Research:**
The most reliable way to ensure all paths and configurations are correct for deployment is to let `vite-plugin-pwa` generate the manifest file during the build process, rather than relying on a static `public/manifest.json` file. This involves moving the manifest object into the `vite.config.ts` file.

## 4. Code Audit & Fixes

I will now audit the codebase against the checklist and apply the necessary fixes.

### Audit Log:
- **(pending)**

### Applied Fixes:
- **(pending)**

## 5. Verification

- **Local Build:** After applying fixes, I will run `npm run build` and inspect the `dist` folder to ensure the generated `manifest.webmanifest` and `sw.js` are correct.
- **Final Review:** I will request a final code review before submitting the changes.