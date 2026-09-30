import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

export default defineConfig({
  site: "https://suchio.net",
  trailingSlash: "never",
  build: { format: "file" },
  adapter: cloudflare({ imageService: "passthrough" }),
  integrations: [react()],
  session: false,
  server: { host: "127.0.0.1", port: 3000 },
});
