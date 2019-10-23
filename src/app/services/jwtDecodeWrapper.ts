import * as jwtDecode from 'jwt-decode';

export class JwtDecodeWrapper {
    public decode<T = any>(jwt: string): T {
        return jwtDecode(jwt);
    }
}
