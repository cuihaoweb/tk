import * as esbuild from 'esbuild';
export type TargetType = string | 'node12' | 'node14' | 'node16' | 'node18' | 'node20';
export interface CopyOptions {
    from: string;
    to: string;
}
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
    };
    copyOptions?: CopyOptions[];
}
export declare class Builder {
    options: BuilderOptions;
    constructor(options: BuilderOptions);
    normalizeOptions(): void;
    get copyList(): any[];
    build(): Promise<void>;
}
