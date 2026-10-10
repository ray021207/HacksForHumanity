import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Emits .next/standalone with a self-contained server.js, so the runtime
	// image carries the server and its traced deps instead of the whole
	// node_modules tree. The Dockerfile copies that folder; see output.md in
	// node_modules/next/dist/docs for the public/.next/static copy step this
	// requires.
	output: 'standalone',

	// The repo root has its own package-lock.json (the Raisee app), so Next
	// infers THAT as the workspace root and traces standalone output relative
	// to it — which nests server.js one level deeper than the Dockerfile
	// expects. Pinning the root keeps the output layout flat and predictable.
	turbopack: {
		root: path.join(import.meta.dirname)
	}
};

export default nextConfig;
