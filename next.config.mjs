import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trace files from this project's own directory, even when it sits inside another checkout.
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
}

export default nextConfig
