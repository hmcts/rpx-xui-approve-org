import { jwtDecode } from 'jwt-decode';
import { JwtDecodeWrapper } from './jwtDecodeWrapper';

function createSyntheticJwt(payload: object): string {
  const encode = (value: object): string =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  return [
    encode({ alg: 'none', typ: 'JWT' }),
    encode(payload),
    ''
  ].join('.');
}

describe('JwtDecodeWrapper service', () => {
  let service: JwtDecodeWrapper;

  beforeEach(() => {
    service = new JwtDecodeWrapper();
  });

  it('should wrap call to JwtDecode - decode()', () => {
    const token = createSyntheticJwt({
      sub: 'sub',
      name: 'Name',
    });

    const libResult = jwtDecode(token);
    const wrapperResult = service.decode(token);

    expect(libResult).toEqual(wrapperResult);
  });
});
