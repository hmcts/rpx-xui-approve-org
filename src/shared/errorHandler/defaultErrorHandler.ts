import { ErrorHandler, Injectable } from '@angular/core';
import { LoggerService } from 'src/app/services/logger.service';

@Injectable()
export class DefaultErrorHandler implements ErrorHandler {
  constructor(
    private _loggerService: LoggerService
  ) { }

    handleError(error: Error) {
        this._loggerService.error(error);
   }
}
