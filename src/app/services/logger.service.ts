import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie';
import { NGXLogger } from 'ngx-logger';
import { CryptoWrapper } from './cryptoWrapper';
import {EnvironmentService} from './environment.service';
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
  constructor(private readonly monitoringService: MonitoringService,
              private readonly ngxLogger: NGXLogger,
              private readonly cookieService: CookieService,
              private readonly cryptoWrapper: CryptoWrapper,
              private readonly jwtDecodeWrapper: JwtDecodeWrapper,
              private readonly envService: EnvironmentService
  ) {}

  public trace(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.trace(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  public debug(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.debug(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  public info(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.info(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  public log(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.log(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  public warn(message: any, ...additional: any[]): void {
    const formattedMessage = this.getMessage(message);
    this.ngxLogger.warn(formattedMessage);
    this.monitoringService.logEvent(message);
  }

  public error(message: any, ...additional: any[]): void {
    this.ngxLogger.error(message);
    const formattedMessage = this.getMessage(message);
    const error = new Error(formattedMessage);
    this.monitoringService.logException(error);
  }

  public fatal(message: any, ...additional: any[]): void {
    this.ngxLogger.fatal(message);
    const formattedMessage = this.getMessage(message);
    const error = new Error(formattedMessage);
    this.monitoringService.logException(error);
  }

  public getMessage(message: any): string {
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
