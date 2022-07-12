import {ReadPostQueryParam} from '@repositories/post';
import {PostCommonType} from '@repositories/post.base';

export type CreatePostRequestParam = PostCommonType & {
    password: string;
};

export type ReadPostRequestParam = Partial<ReadPostQueryParam>;

export type UpdatePostRequestParam = {id: number; password: string} & Partial<PostCommonType>;

export type DeletePostRequestParam = {id: number; password: string};
