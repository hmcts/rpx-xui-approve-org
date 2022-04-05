import 'express-session'

// workaround typing due to: https://github.com/expressjs/session/issues/792
declare module 'express-session' {
  interface Session {
    passport: any;
  }
}