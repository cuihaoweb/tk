import winston from 'winston';
import path from 'path';
import 'winston-daily-rotate-file';

export class Logger {
    context = process.cwd();
    logDir = path.join(this.context, 'logs');
    private logger: winston.Logger;
    private isAddConsole = false;

    constructor(options: { isAddConsole?: boolean } = {}) {
        this.isAddConsole = options.isAddConsole ?? process.env.NODE_ENV !== 'production';
        this.logger = this.createLogger();
    }

    private createLogger() {
        return winston.createLogger({
            level: 'debug',
            format: winston.format.combine(
                winston.format.json(),
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize({ all: true }),
                        winston.format.simple(),
                    ),
                }),
                new winston.transports.DailyRotateFile({
                    level: 'error',
                    dirname: this.logDir,
                    filename: 'application-error-%DATE%.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    maxSize: '20m',
                }),
                new winston.transports.DailyRotateFile({
                    level: 'debug',
                    dirname: this.logDir,
                    filename: 'application-debug-%DATE%.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    maxSize: '20m',
                }),
                new winston.transports.DailyRotateFile({
                    level: 'info',
                    dirname: this.logDir,
                    filename: 'application-info-%DATE%.log',
                    datePattern: 'YYYY-MM-DD-HH',
                    maxSize: '20m',
                })
            ],
        });
    }

    getLogger() {
        return this.logger;
    }
}

export const logger = new Logger().getLogger();