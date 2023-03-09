const esbuild = require("esbuild");
const { Generator } = require("npm-dts");
const { nodeExternalsPlugin } = require("esbuild-node-externals");

new Generator({
  entry: "src/index.ts",
  output: "dist/index.d.ts",
}).generate();

esbuild
  .build({
    entryPoints: ["src/index.ts"],
    outfile: "dist/index.js",
    bundle: true,
    minify: true,
    platform: "node",
    sourcemap: true,
    target: "node14",
    // watch: true, // process.argv[2] === "--watch",
    plugins: [nodeExternalsPlugin()],
  })
  .catch(() => process.exit(1));
