import { Injectable } from '@angular/core';
import * as jwtDecode from 'jwt-decode';

@Injectable()
export class JwtDecodeWrapper {
    decode(jwt: string): any {
        return jwtDecode(jwt);
    }
}
