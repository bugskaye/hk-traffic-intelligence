import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  // 🟢 補上這行：強制指定 ViNext 建置工具將 Next.js 網頁檔案輸出到 .vercel/output 目錄
  outputDir: ".vercel/output",
  worker: defineWorker({
    name: "hktraffic",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-09-29",
    placement: { mode: "smart" },
    compatibilityFlags: ["nodejs_compat"],
    assets: { notFoundHandling: "none" },
    env: {
      ASSETS: bindings.assets(),
      VISITS: bindings.analyticsEngineDataset({ name: "hktraffic_visits" }),
      VISIT_COUNTS: bindings.kv({ id: "f7b62c640e0b484b88e6005025615f3e" }),
    },
  }),
});
