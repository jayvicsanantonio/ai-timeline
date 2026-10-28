// OpenNext configuration for `opennextjs-cloudflare build`, which runs `next build` and bundles the output into a Cloudflare Worker.
// Every page is prerendered, so no incremental cache is set; see https://opennext.js.org/cloudflare/caching before adding ISR.
import { defineCloudflareConfig } from "@opennextjs/cloudflare"

export default defineCloudflareConfig()
