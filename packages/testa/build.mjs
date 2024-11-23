import {Builder} from 'tk-build';

const builder = new Builder({
    context: process.cwd(),
    entry: ['./src/index.ts'],
    splitting: true,
    output: {
        dir: 'dist',
        filename: 'index.js',
    },
    format: 'esm',
    minify: true,
    tsc: true,
    watch: {
        onRebuild(options) {
            console.log(`🚀 ~ file: build.mjs:14 ~ onRebuild ~ options:`, options);
        }
    }
});
await builder.build();