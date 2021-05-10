import * as express from 'express';

export interface EnhancedRequest extends express.Request {
  auth?: {
    roles: string[];
    token: string;
    userId: string;
    expires: number;
    data?: any;
  };
  body;
  headers;
  session?;
  url: string;
}
