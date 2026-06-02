// Dedicated build config for the standalone APK bundle.
// Produces a static SPA (client-only) into dist/client with an index.html
// shell that boots the TanStack Router on the device. Used by Capacitor.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Force a plain Vite build (no Cloudflare/Nitro server bundle).
  nitro: false,
  // Enable SPA mode so a static index.html shell is emitted and the app
  // hydrates/render entirely on the client — required for a webview APK.
  tanstackStart: {
    spa: { enabled: true },
  },
});
