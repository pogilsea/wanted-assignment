import crypto from 'crypto';
export interface IPasswordCrypto {
    encrypt(passwordText: string): EncryptType;
    decrypt(passwordText: EncryptType): string;
}
export class PasswordCrypto implements IPasswordCrypto {
    algorithm: string;
    secretKey: string;
    constructor() {
        this.algorithm = 'aes-256-ctr';
        this.secretKey = process.env.PASSWORD_SEC_KEY || 'c08eed8f5e583963c1a4a3b54302a1a3';
    }
    encrypt(passwordText: string) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.secretKey, iv);
        const encrypted = Buffer.concat([cipher.update(passwordText), cipher.final()]);
        return {iv: iv.toString('hex'), encrypted: encrypted.toString('hex')};
    }

    decrypt(hash: EncryptType) {
        const {iv, encrypted} = hash;
        const decipher = crypto.createDecipheriv(this.algorithm, this.secretKey, Buffer.from(iv, 'hex'));
        const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'hex')), decipher.final()]);
        return decrypted.toString();
    }
}
type EncryptType = {iv: string; encrypted: string};
