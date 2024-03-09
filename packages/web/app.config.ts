import { defineConfig } from '@solidjs/start/config';
import { imagetools } from 'vite-imagetools';
import viteSvgSpriteWrapper from 'vite-svg-sprite-wrapper';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  ssr: true,
  middleware: './src/middleware.ts',
  devOverlay: false,
  server: {
    preset: 'cloudflare_pages',
    rollupConfig: {
      external: ['node:async_hooks'],
    },
    database: {
      // D1
      // default: {
      //   connector: 'cloudflare-d1',
      //   options: { bindingName: 'db' }
      // },
      default: {
        connector: 'sqlite',
        options: { name: 'db' },
      },
    },
    experimental: {
      database: true,
    },
  },
  vite: {
    css: {
      postcss: '../config/postcss.config.cjs',
    },
    plugins: [
      tsconfigPaths(),
      imagetools(),
      viteSvgSpriteWrapper({
        icons: '../config/icons/source/*.svg',
        outputDir: '../config/icons',
        generateType: true,
        typeOutputDir: '../ui/src/icon',
        sprite: {
          shape: {
            dimension: {
              attributes: true, // Width and height attributes on embedded shapes
            },
          },
        },
      }),
    ],
  },
});
