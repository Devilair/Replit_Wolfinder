import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'src/subscription-features.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['drizzle-orm', 'drizzle-zod'],
  noExternal: ['@wolfinder/shared'],
}); 