import { Builder } from 'tk-build';

const builder = new Builder({
    context: process.cwd(),
    entry: ['src/index.ts'],
    output: {
        dir: 'dist',
        filename: 'index.js'
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    splitting: true,
    package: 'bundle',
    tsc: true,
    watch: {
        onRebuild(options) {
            console.log(`🚀 ~ file: build.mjs:14 ~ onRebuild ~ options:`, options);
        }
    },
    copyOptions: [
        { from: '*.json', to: 'dist/' },
    ]
});

await builder.build();