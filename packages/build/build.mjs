import * as esbuild from 'esbuild';
import { execSync } from 'child_process';

const ctx = await esbuild.context({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'dist/index.js',
    platform: 'node',
    target: 'node16',
    format: 'esm',
    packages: "external",
    banner: {
        'js': '#!/usr/bin/env node'
    },
    logLevel: 'info',
    plugins: [
        {
            name: 'copy-file',
            setup(build) {
                build.onEnd(async () => {
                    const dscRes = await execSync('npx tsc', { stdio: 'inherit' });
                    console.log(`🚀 ~ file: build.mjs:22 ~ build.onEnd ~ dscRes:`, dscRes);
                });
            }
        }
    ],
});

const watcher = await ctx.watch();

