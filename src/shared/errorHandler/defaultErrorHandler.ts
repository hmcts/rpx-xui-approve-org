import { ErrorHandler, Injectable} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
// import { LoggerService } from 'src/app/services/logger.service';

@Injectable()
export class DefaultErrorHandler implements ErrorHandler {
  constructor(
    // private loggerService: LoggerService
  ) { }

    handleError(error: Error) {
        // this.loggerService.error(error);
   }
}
