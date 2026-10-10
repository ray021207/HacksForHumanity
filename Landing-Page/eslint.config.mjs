import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

// eslint-config-next ships native flat configs in Next 16 — routing them
// through FlatCompat blows up with a circular-structure error.
export default defineConfig([
	...nextVitals,
	...nextTs,
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts'])
]);
