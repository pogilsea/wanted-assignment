import createHttpError from 'http-errors';
import {HTTP_RESPONSE_CODE} from '@utils/error-code';

export interface ICommentValidateHelper {
    assertCommentExist(post: any): void;
    assertPostExist(post: any): void;
}
export class CommentValidateHelper implements ICommentValidateHelper {
    assertPostExist(post: any) {
        if (!post) {
            const message = '작성하려는 댓글의 게시글이 삭제되어 댓글을 작성할 수 없습니다.';
            throw createHttpError(HTTP_RESPONSE_CODE.GONE, message);
        }
    }
    assertCommentExist(comment: any) {
        if (!comment) {
            const message = '작성하시려는 상위 댓글이 삭제되어 댓글을 작성할 수 없습니다.';
            throw createHttpError(HTTP_RESPONSE_CODE.GONE, message);
        }
    }
}
