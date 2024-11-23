import {Builder} from 'tk-build';

const builder = new Builder({
    entry: ['src/index.ts'],
    output: {
        dir: 'dist',
        filename: 'index.js'
    },
    watch: {
        onRebuild(options) {
            console.log(`🚀 ~ file: build.mjs:14 ~ onRebuild ~ options:`, options);
        }
    }
});

await builder.build();