import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import string from 'vite-plugin-string'

export default defineConfig({
 plugins: [
   react(),
   // ✅ Removido el include de CSS - ahora solo para archivos que realmente necesitas como string
   string({
     include: '**/*.glsl' // Solo para shaders u otros archivos que necesites como string
   })
 ],
 server: {
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     }
   }
 },
 esbuild: {
   loader: "jsx",
   include: /src\/.*\.jsx?$/,
   exclude: [],
 },
 optimizeDeps: {
   esbuildOptions: {
     loader: {
       '.js': 'jsx',
     },
   },
 },
})