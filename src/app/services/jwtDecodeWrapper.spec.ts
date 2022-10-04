import * as jwtDecode from 'jwt-decode';
import { JwtDecodeWrapper } from './jwtDecodeWrapper';

describe('JwtDecodeWrapper service', () => {
    let service: JwtDecodeWrapper;

    beforeEach(() => {
        service = new JwtDecodeWrapper();
    });

    it('should wrap call to JwtDecode - decode()', () => {
        const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c0';

        const libResult = jwtDecode(token);
        const wrapperResult = service.decode(token);

        expect(libResult).toEqual(wrapperResult);
    });
});
