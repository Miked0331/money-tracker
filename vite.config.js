import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/money-tracker/',  // matches your repo name
  plugins: [react()],
});
