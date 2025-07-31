// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import bun from "@nurodev/astro-bun";

// https://astro.build/config
export default defineConfig({
  adapter: bun(), 
  output: "server",
  integrations: [
    mdx(),
    preact(),
    (await import("@playform/compress")).default({
      CSS: {
        lightningcss: true, 
        csso: false,
      },
      HTML: {
        "html-minifier-terser": {
          removeAttributeQuotes: true,
        },
      },
      Image: {
        sharp: {
          avif: {
            quality: 65,
            effort: 9,
            chromaSubsampling: "4:2:0",
          }
        }
      },
      JavaScript: {
        terser: {
          ecma: 2020,
        }
      },
      JSON: true,
      SVG: {
        svgo: {
          floatPrecision: 3,
          multipass: true,
        }
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    build: {
      sourcemap: true
    },
    server: {
      hmr: {
        port: 4321,
        protocol: 'ws',
        host: 'localhost'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
        },
      },
    },
  },
});