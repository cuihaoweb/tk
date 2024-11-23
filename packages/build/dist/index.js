#!/usr/bin/env node

// src/index.ts
import * as esbuild from "esbuild";
import path from "path";
import { createRequire } from "module";
import { exec } from "child_process";
import { globSync } from "glob";
import copy from "esbuild-copy-static-files";
var require2 = createRequire(import.meta.url);
var Builder = class {
  options;
  constructor(options) {
    this.options = options;
    Object.assign(this.options, {
      ...options,
      bundle: options.bundle ?? true
    });
    this.options.context = options.context || process.cwd() || "";
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
    var _a;
    const { options } = this;
    if (options.package === "external") {
      const tsconfig = require2(path.join(options.context || "", "tsconfig.json"));
      const paths = ((_a = tsconfig == null ? void 0 : tsconfig.compilerOptions) == null ? void 0 : _a.paths) || {};
      for (const key in paths) {
        options.alias[key] = paths[key][0];
      }
    }
    for (const key in this.options.entry) {
      this.options.entry[key] = path.join(this.options.context || "", this.options.entry[key]);
    }
    this.options.output.dir = path.join(this.options.context || "", this.options.output.dir);
    if (this.options.format === "cjs") {
      this.options.platform = "node";
    }
  }
  get copyList() {
    const { options } = this;
    if (!Array.isArray(options.copyOptions)) return [];
    const copyList = [];
    for (const item of options.copyOptions) {
      const pathList = globSync(item.from);
      const dest = (h) => item.to.endsWith("/") ? `${item.to}${path.basename(h)}` : item.to;
      copyList.push(...pathList.map((h) => ({ src: h, dest: dest(h) })));
    }
    console.log(`\u{1F680} ~ file: index.ts:96 ~ Builder ~ getcopyList ~ copyList:`, copyList);
    return copyList.map((option) => copy(option));
  }
  async build() {
    const that = this;
    const { options } = this;
    const ctx = await esbuild.context({
      entryPoints: this.options.entry,
      outfile: this.options.splitting ? "" : `${this.options.output.dir}/${this.options.output.filename}`,
      outdir: this.options.splitting ? this.options.output.dir : "",
      target: this.options.target,
      platform: this.options.platform,
      bundle: options.bundle,
      packages: this.options.package,
      external: this.options.external,
      alias: this.options.alias,
      logLevel: "info",
      format: this.options.format,
      splitting: this.options.splitting,
      minify: this.options.minify,
      plugins: [
        {
          name: "esbuild-node-externals",
          setup(build) {
            build.onEnd((options2) => {
              var _a, _b;
              if (typeof that.options.watch === "object") {
                (_b = (_a = that.options.watch).onRebuild) == null ? void 0 : _b.call(_a, options2);
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
        },
        ...this.copyList
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
