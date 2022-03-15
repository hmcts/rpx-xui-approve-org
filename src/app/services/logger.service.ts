import { MonitoringService } from './monitoring.service';
import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { CryptoWrapper } from './cryptoWrapper';
import { JwtDecodeWrapper } from './jwtDecodeWrapper';
import {EnvironmentService} from './environment.service';

export interface ILoggerService {
    trace(message: any): void;
    debug(message: any): void;
    info(message: any): void;
    log(message: any): void;
    warn(message: any): void;
    error(message: any): void;
    fatal(message: any): void;
    getMessage(message: any): string;
}

@Injectable()
export class LoggerService implements ILoggerService {
    constructor(private monitoringService: MonitoringService,
                private cookieService: CookieService,
                private cryptoWrapper: CryptoWrapper,
                private jwtDecodeWrapper: JwtDecodeWrapper,
                private envService: EnvironmentService) {
    }

    trace(message: any): void {
        this.monitoringService.logEvent(message);
    }
    debug(message: any): void {
        this.monitoringService.logEvent(message);
    }
    info(message: any): void {
        this.monitoringService.logEvent(message);
    }
    log(message: any): void {
        this.monitoringService.logEvent(message);
    }
    warn(message: any): void {
        this.monitoringService.logEvent(message);
    }
    error(message: any): void {
       const formattedMessage = this.getMessage(message);
       const error = new Error(formattedMessage);
       this.monitoringService.logException(error);
    }
    fatal(message: any): void {
        const formattedMessage = this.getMessage(message);
        const error = new Error(formattedMessage);
        this.monitoringService.logException(error);
    }
    getMessage(message: any): string {
        // const jwt = this.cookieService.get(this.envService.cookies.token);
        const jwt = this.cookieService.get(this.envService.get('cookies').token);
        if (jwt) {
            const jwtData = this.jwtDecodeWrapper.decode(jwt);
            if (jwtData) {
                const userIdEncrypted = this.cryptoWrapper.encrypt(jwtData.sub);
                return `User - ${userIdEncrypted.toString()}, Message - ${message}, Timestamp - ${Date.now()}`;
            } else {
                return `Message - ${message}, Timestamp - ${Date.now()}`;
            }
        }
    }
}
