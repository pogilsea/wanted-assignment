import {OkPacket} from 'mysql';
import {IPostBaseRepository, PostBaseRepository, PostCommonType} from '@repositories/post.base';
import {ReadPostRequestParam} from '@controllers/post/entity';

export interface IPostRepository extends IPostBaseRepository {
    createPost(param: CreatePostRowParam): Promise<OkPacket>;
    readAllPostList(param: ReadPostRequestParam): Promise<PostDBRowResponse[]>;
    updatePost(param: UpdatePostRowParam): Promise<OkPacket>;
    deletePost(id: number): Promise<OkPacket>;
}

export class PostRepository extends PostBaseRepository implements IPostRepository {
    constructor() {
        super();
    }
    async createPost(param: CreatePostRowParam) {
        const {author, iv, encrypted, title, content} = param;
        return this.insert({title, author, iv, encrypted, content});
    }
    async readAllPostList(param: ReadPostRequestParam) {
        const {offset, limit, searchProperty, searchValue} = param;
        const fields = ['id', 'title', 'content', 'author', 'updatedAt', 'createdAt'];
        let key = {};
        if (searchProperty === 'author') {
            key = {[searchProperty]: searchValue + '%'};
        }
        if (searchProperty === 'title') {
            key = {[searchProperty]: searchValue + '*'};
        }
        return this.read(key, {offset, limit, noCondition: true, fields});
    }
    async updatePost(param: UpdatePostRowParam) {
        const {id, ...data} = param;
        return this.updateOne({postId: id}, data);
    }
    async deletePost(id: number) {
        return this.remove({postId: id});
    }
}

export type CreatePostRowParam = PostCommonType & {
    iv: string;
    encrypted: string;
};

export type ReadPostQueryParam = {limit: number; offset: number} & Partial<{
    searchProperty: string;
    searchValue: string;
}>;

export type UpdatePostRowParam = {id: number} & Partial<PostCommonType>;

export type PostDBRowResponse = PostCommonType & {
    id: number;
    updatedAt: string;
    createdAt: string;
};
