import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base:"/page",
  plugins: [react()],
  optimizeDeps: {
    include: ['@mui/material/Tooltip', '@emotion/styled', '@mui/material/Unstable_Grid2'],
  },
})
