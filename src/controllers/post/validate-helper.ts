import createHttpError from 'http-errors';
import {PasswordCrypto} from '@controllers/common';
import {HTTP_RESPONSE_CODE} from '@utils/error-code';

export interface IPostValidateHelper {
    assertPostExist(post: any): void;
    assertPasswordCorrect(passwordStr: string, iv: string, encrypted: string): void;
}
export class PostValidateHelper implements IPostValidateHelper {
    passwordCrypto;
    constructor() {
        this.passwordCrypto = new PasswordCrypto();
    }
    assertPasswordCorrect(passwordStr: string, iv: string, encrypted: string) {
        const decryptedPwd = this.passwordCrypto.decrypt({iv, encrypted});
        if (passwordStr !== decryptedPwd) {
            const message = '게시글 비밀번호가 일치하지 않습니다.';
            throw createHttpError(HTTP_RESPONSE_CODE.NOT_AUTHORIZED, message);
        }
    }
    assertPostExist(post: any) {
        if (!post) {
            const message = '요청하신 게시글은 존재하지 않습니다.';
            throw createHttpError(HTTP_RESPONSE_CODE.GONE, message);
        }
    }
}
