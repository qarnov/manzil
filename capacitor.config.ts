import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.manzil.app",
  appName: "Manzil",
  webDir: "dist/client",
  android: {
    allowMixedContent: true,
  },
};

export default config;
