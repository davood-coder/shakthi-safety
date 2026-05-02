// vite.config.ts
import { defineConfig } from "file:///C:/Users/patta/OneDrive/Desktop/sakhi-safety-guardian-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/patta/OneDrive/Desktop/sakhi-safety-guardian-main/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///C:/Users/patta/OneDrive/Desktop/sakhi-safety-guardian-main/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\patta\\OneDrive\\Desktop\\sakhi-safety-guardian-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "127.0.0.1",
    port: 5173,
    hmr: {
      overlay: false
    }
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYXR0YVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHNha2hpLXNhZmV0eS1ndWFyZGlhbi1tYWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxwYXR0YVxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXHNha2hpLXNhZmV0eS1ndWFyZGlhbi1tYWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9wYXR0YS9PbmVEcml2ZS9EZXNrdG9wL3Nha2hpLXNhZmV0eS1ndWFyZGlhbi1tYWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHsgY29tcG9uZW50VGFnZ2VyIH0gZnJvbSBcImxvdmFibGUtdGFnZ2VyXCI7XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiAoe1xuICBzZXJ2ZXI6IHtcbiAgICBob3N0OiBcIjEyNy4wLjAuMVwiLFxuICAgIHBvcnQ6IDUxNzMsXG4gICAgaG1yOiB7XG4gICAgICBvdmVybGF5OiBmYWxzZSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbcmVhY3QoKSwgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpXS5maWx0ZXIoQm9vbGVhbiksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFcsU0FBUyxvQkFBb0I7QUFDelksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUhoQyxJQUFNLG1DQUFtQztBQU16QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLEtBQUs7QUFBQSxNQUNILFNBQVM7QUFBQSxJQUNYO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDLE1BQU0sR0FBRyxTQUFTLGlCQUFpQixnQkFBZ0IsQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUFBLEVBQzlFLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
