import { Injectable } from '@angular/core';
import jwt_decode from "jwt-decode";

@Injectable()
export class JwtDecodeWrapper {
    decode(jwt: string): any {
        return jwt_decode(jwt);
    }
}
