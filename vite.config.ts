import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/ratoncito-clinical/",
  build: {
    target: "es2020",
    sourcemap: false
  }
});
