import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    monkey({
      entry: "src/main.ts",
      userscript: {
        icon: "https://vitejs.dev/logo.svg",
        namespace: "star.less",
        version: "1.0.0",
        description: "Darkless Reader",
        author: "Darkless",
        homepage: "https://github.com/SternChi/vite-userscript",
        match: ["https://cenele.com/*", "https://kolbook.xyz/*"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
