import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import obfuscatorPlugin from "vite-plugin-obfuscator";

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    command === 'build' && obfuscatorPlugin({
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        debugProtectionInterval: 0,
        disableConsoleOutput: true,
        identifierNamesGenerator: "hexadecimal",
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.5,
        stringArrayEncoding: ["base64"],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 1,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 2,
        stringArrayWrappersType: "variable",
        stringArrayThreshold: 0.75,
        unicodeEscapeSequence: false,
      },
    }),
  ],
  server: { port: 3000 },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
}));
