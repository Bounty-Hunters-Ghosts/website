// @ts-check
import path from 'path';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import preact from '@astrojs/preact';
import bun from "@nurodev/astro-bun";

const __dirname = path.resolve();

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
    resolve: {
      alias: {
        'react': 'preact/compat',
        'react-dom': 'preact/compat',

        '@': path.resolve(__dirname, './src'),
        '@public': path.resolve(__dirname, './public'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@css': path.resolve(__dirname, './src/styles'),
        '@lib': path.resolve(__dirname, './src/scripts'),
        '@comp': path.resolve(__dirname, './src/components'),
      }
    }
  },
});