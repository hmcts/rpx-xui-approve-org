import { Injectable } from '@angular/core';
import { AES, enc, SHA256, WordArray } from 'crypto-js';

@Injectable()
export class CryptoWrapper {
    encrypt(message: string, secret: string = 'secret'): WordArray {
        const userIdEncrypted = AES.encrypt(message, secret, SHA256);
        return userIdEncrypted;
    }

    decrypt(encrypted: WordArray, secret: string = 'secret'): string {
        return AES.decrypt(encrypted, secret, SHA256).toString(enc.Utf8);
    }
}
