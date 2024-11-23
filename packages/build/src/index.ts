
import * as esbuild from 'esbuild';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { exec } from 'child_process';

export type TargetType = string | 'node12' | 'node14' | 'node16' | 'node18' | 'node20';

export interface BuilderOptions {
    context?: string;
    entry: string[] | Record<string, string>;
    output: {
        dir: string;
        filename: string;
    };
    target?: esbuild.BuildOptions['target'];
    platform?: esbuild.BuildOptions['platform'];
    format?: esbuild.BuildOptions['format'];
    package?: 'bundle' | 'external';
    splitting?: boolean;
    external?: string[];
    alias?: esbuild.BuildOptions['alias'];
    tsc?: boolean;
    minify?: boolean;
    bundle: boolean;
    watch?: boolean | {
        onRebuild: (result: esbuild.BuildResult<esbuild.BuildOptions>) => any;
    }
}

export class Builder {
    options: BuilderOptions;

    constructor(options: BuilderOptions) {
        this.options = options;
        Object.assign(this.options, {
            ...options,
            bundle: options.bundle ?? true,
        } as BuilderOptions);
        this.options.context = options.context || process.cwd() || '';
        this.options.target = options.target || 'node18';
        this.options.format = options.format || 'cjs';
        this.options.package = options.package || 'bundle';
        this.options.external = options.external || [];
        this.options.platform = options.platform || 'neutral';
        this.options.alias = options.alias || {};
        this.options.splitting = options.splitting ?? false;
        this.options.tsc = options.tsc || false;
        this.options.minify = options.minify || false;

        this.normalizeOptions();
    }

    normalizeOptions() {
        const {options} = this;
        // load tsconfig.json and add alias
        if (options.package === 'external') {
            const tsconfig =  require(path.join(options.context || '', 'tsconfig.json'));
            const paths = tsconfig?.compilerOptions?.paths || {};
            for (const key in paths) {
                options.alias![key] = paths[key][0];
            }
        }

        // resolve entry path
        for (const key in this.options.entry) {
            this.options.entry[key] = path.join(this.options.context || '', this.options.entry[key]);
        }

        // resolve output path
        this.options.output.dir = path.join(this.options.context || '', this.options.output.dir);

        if (this.options.format === 'cjs') {
            this.options.platform = 'node';
        }
    }

    async build() {
        const that = this;
        const {options} = this;
        const ctx = await esbuild.context({
            entryPoints: this.options.entry,
            outfile: this.options.splitting ? '' : `${this.options.output.dir}/${this.options.output.filename}`,
            outdir: this.options.splitting ? this.options.output.dir : '',
            target: this.options.target,
            platform: this.options.platform,
            bundle: options.bundle,
            packages: this.options.package,
            external: this.options.external,
            alias: this.options.alias,
            logLevel: 'info',
            format: this.options.format,
            splitting: this.options.splitting,
            minify: this.options.minify,
            plugins: [
                {
                    name: 'esbuild-node-externals',
                    setup(build) {
                        build.onEnd((options) => {
                            if (typeof that.options.watch === 'object') {
                                that.options.watch.onRebuild?.(options);
                            }
                            if (that.options.tsc) {
                                exec('npx tsc', (err, stdout) => {
                                    if (err) {
                                        console.log(err);
                                    }
                                    console.log(stdout);
                                });
                            }
                        })
                    }
                }
            ]
        });

        if (this.options.watch) {
            await ctx.watch();
        }
    }
}
