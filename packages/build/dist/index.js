#!/usr/bin/env node

// src/index.ts
import * as esbuild from "esbuild";
import path from "path";
import { createRequire } from "module";
import { exec } from "child_process";
var require2 = createRequire(import.meta.url);
var Builder = class {
  options;
  constructor(options) {
    this.options = options;
    this.options.target = options.target || "node18";
    this.options.format = options.format || "cjs";
    this.options.package = options.package || "bundle";
    this.options.external = options.external || [];
    this.options.platform = options.platform || "neutral";
    this.options.alias = options.alias || {};
    this.options.splitting = options.splitting ?? false;
    this.options.tsc = options.tsc || false;
    this.options.minify = options.minify || false;
    this.normalizeOptions();
  }
  normalizeOptions() {
    const tsconfig = require2(path.join(this.options.context, "tsconfig.json"));
    const paths = tsconfig.compilerOptions.paths;
    for (const key in paths) {
      this.options.alias[key] = paths[key][0];
    }
    for (const key in this.options.entry) {
      this.options.entry[key] = path.join(this.options.context, this.options.entry[key]);
    }
    this.options.output.dir = path.join(this.options.context, this.options.output.dir);
    if (this.options.format === "cjs") {
      this.options.platform = "node";
    }
  }
  async build() {
    const that = this;
    const ctx = await esbuild.context({
      entryPoints: this.options.entry,
      outfile: this.options.splitting ? "" : `${this.options.output.dir}/${this.options.output.filename}`,
      outdir: this.options.splitting ? this.options.output.dir : "",
      target: this.options.target,
      platform: this.options.platform,
      bundle: this.options.package === "bundle",
      external: this.options.package === "external" ? ["*"] : this.options.external,
      alias: this.options.alias,
      logLevel: "info",
      splitting: this.options.splitting,
      minify: this.options.minify,
      plugins: [
        {
          name: "esbuild-node-externals",
          setup(build) {
            build.onEnd((options) => {
              var _a, _b;
              if (typeof that.options.watch === "object") {
                (_b = (_a = that.options.watch).onRebuild) == null ? void 0 : _b.call(_a, options);
              }
              if (that.options.tsc) {
                exec("npx tsc", (err, stdout) => {
                  if (err) {
                    console.log(err);
                  }
                  console.log(stdout);
                });
              }
            });
          }
        }
      ]
    });
    if (this.options.watch) {
      await ctx.watch();
    }
  }
};
export {
  Builder
};
