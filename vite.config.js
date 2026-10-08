import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    host: true, // permite abrir pelo celular na mesma rede (http://<ip-da-maquina>:5173)
    port: 5173,
  },
  build: {
    target: 'es2019',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // O banco de questões e a cidade saem do caminho crítico; o runtime do
        // React fica num chunk próprio para aproveitar o cache entre deploys.
        // (React precisa ficar junto de scheduler/react-dom, senão os chunks
        // ficam circulares.)
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)) return 'vendor-react'
            return 'vendor'
          }
          if (id.includes('/src/data/questions/')) return 'banco-questoes'
          if (id.includes('/src/components/city/')) return 'cidade'
          return undefined
        },
      },
    },
  },
})
