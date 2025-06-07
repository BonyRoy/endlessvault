import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import flowPlugin from 'vite-plugin-flow';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
});
