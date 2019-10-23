import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from 'src/app/services/logger.service';

@Injectable()
export class DefaultErrorHandler implements ErrorHandler {
  constructor(
    private readonly _loggerService: LoggerService
  ) { }

  public handleError(error: Error) {
    this._loggerService.error(error);
  }
}
