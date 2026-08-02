// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     port: 5173,
//     open: true,
//   },
// })

// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   build: {
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           // Pisahkan library besar ke chunk terpisah
//           vendor: ['react', 'react-dom'],
//           recharts: ['recharts'],
//           'xlsx': ['xlsx'],
//         },
//       },
//     },
//     chunkSizeWarningLimit: 500,
//     sourcemap: false, // matikan di production
//     minify: 'terser',
//     terserOptions: {
//       compress: {
//         drop_console: true, // hapus console.log di production
//         drop_debugger: true,
//       },
//     },
//   },
//   server: {
//     // Optimasi development
//     hmr: {
//       overlay: false,
//     },
//   },
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import purgecss from 'vite-plugin-purgecss';

export default defineConfig({
  plugins: [
    react(),
    compression({ algorithm: 'gzip' }),
    purgecss({
      content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'recharts': ['recharts'],
          'xlsx': ['xlsx'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 500,
  },
});