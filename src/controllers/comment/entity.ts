import {CreateCommentRowParam} from '@repositories/comment';

export type CreateCommentRequestParam = CreateCommentRowParam;
export type ReadCommentRequestParam = {
    postId: number;
    limit?: number;
    offset?: number;
};
