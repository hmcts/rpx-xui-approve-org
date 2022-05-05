import { Injectable } from '@angular/core';
import { AES, enc, SHA256 } from 'crypto-js';

@Injectable()
export class CryptoWrapper {
    encrypt(message: string, secret: string = 'secret'): CryptoJS.lib.CipherParams {
        const userIdEncrypted = AES.encrypt(message, secret, SHA256);
        return userIdEncrypted;
    }

    decrypt(encrypted: CryptoJS.lib.CipherParams, secret: string = 'secret'): string {
        return AES.decrypt(encrypted, secret, SHA256).toString(enc.Utf8);
    }
}
