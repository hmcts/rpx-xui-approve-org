import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { NGXLogger } from 'ngx-logger';
import config from '../../../api/lib/config';
import { CryptoWrapper } from './cryptoWrapper';
import { JwtDecodeWrapper } from './jwtDecodeWrapper';
import { MonitoringService } from './monitoring.service';

export interface ILoggerService {
    trace(message: any, ...additional: any[]): void;
    debug(message: any, ...additional: any[]): void;
    info(message: any, ...additional: any[]): void;
    log(message: any, ...additional: any[]): void;
    warn(message: any, ...additional: any[]): void;
    error(message: any, ...additional: any[]): void;
    fatal(message: any, ...additional: any[]): void;
    getMessage(message: any): string;
}

@Injectable()

export class LoggerService implements ILoggerService {
    public COOKIE_KEYS: { TOKEN: string; USER: string; };

    constructor(
        private readonly _monitoringService: MonitoringService,
        private readonly _ngxLogger: NGXLogger,
        private readonly _cookieService: CookieService,
        private readonly _cryptoWrapper: CryptoWrapper,
        private readonly _jwtDecodeWrapper: JwtDecodeWrapper
    ) {
        this.COOKIE_KEYS = {
            TOKEN: config.cookies.token,
            USER: config.cookies.userId
        };
    }

    public trace(message: any, ...additional: any[]): void {
        const formattedMessage = this.getMessage(message);
        this._ngxLogger.trace(formattedMessage);
        this._monitoringService.logEvent(message);
    }
    public debug(message: any, ...additional: any[]): void {
        const formattedMessage = this.getMessage(message);
        this._ngxLogger.debug(formattedMessage);
        this._monitoringService.logEvent(message);
    }
    public info(message: any, ...additional: any[]): void {
        const formattedMessage = this.getMessage(message);
        this._ngxLogger.info(formattedMessage);
        this._monitoringService.logEvent(message);
    }
    public log(message: any, ...additional: any[]): void {
        const formattedMessage = this.getMessage(message);
        this._ngxLogger.log(formattedMessage);
        this._monitoringService.logEvent(message);
    }
    public warn(message: any, ...additional: any[]): void {
        const formattedMessage = this.getMessage(message);
        this._ngxLogger.warn(formattedMessage);
        this._monitoringService.logEvent(message);
    }
    public error(message: any, ...additional: any[]): void {
       this._ngxLogger.error(message);
       const formattedMessage = this.getMessage(message);
       const error = new Error(formattedMessage);
       this._monitoringService.logException(error);
    }
    public fatal(message: any, ...additional: any[]): void {
        this._ngxLogger.fatal(message);
        const formattedMessage = this.getMessage(message);
        const error = new Error(formattedMessage);
        this._monitoringService.logException(error);
    }
    public getMessage(message: any): string {
        const jwt = this._cookieService.get(this.COOKIE_KEYS.TOKEN);
        const jwtData = this._jwtDecodeWrapper.decode(jwt);
        if (jwtData) {
            const userIdEncrypted = this._cryptoWrapper.encrypt(jwtData.sub);
            return `User - ${userIdEncrypted.toString()}, Message - ${message}, Timestamp - ${Date.now()}`;
        } else {
            return `Message - ${message}, Timestamp - ${Date.now()}`;
        }
    }
}
