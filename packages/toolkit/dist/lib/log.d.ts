import winston from 'winston';
import 'winston-daily-rotate-file';
export declare class Logger {
    context: string;
    logDir: string;
    private logger;
    private isAddConsole;
    constructor(options?: {
        isAddConsole?: boolean;
    });
    private createLogger;
    getLogger(): winston.Logger;
}
export declare const logger: winston.Logger;
