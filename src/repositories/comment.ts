import {CommentBaseRepository, CommentBaseType, ICommentBaseRepository} from '@repositories/comment.base';
import {OkPacket} from 'mysql';

export interface ICommentRepository extends ICommentBaseRepository {
    create(param: CreateCommentRowParam): Promise<OkPacket>;
    readByPostId(postId: number): Promise<CommentDBResponse[]>;
}

export class CommentRepository extends CommentBaseRepository implements ICommentRepository {
    constructor() {
        super();
    }
    async create(param: CreateCommentRowParam) {
        const {author, postId, content, groupId} = param;
        let depth = !!groupId ? 2 : 1;
        let sequence = 1;
        if (groupId) {
            sequence = (await this.count({groupId})) + 1;
        }
        const response = await this.insert({author, content, postId, groupId, sequence, depth});
        if (!groupId && response.insertId) {
            const {insertId: commentId} = response;
            await this.updateOne({commentId}, {groupId: commentId});
        }
        return response;
    }

    async readByPostId(postId: number) {
        const fields = ['id', 'postId', 'author', 'groupId', 'sequence', 'depth', 'content', 'createdAt'];
        const orderBy = [
            {fieldName: 'IFNULL(groupId,id)', sort: 'ASC'},
            {fieldName: 'sequence', sort: 'ASC'},
            {fieldName: 'id', sort: 'ASC'},
        ];
        return this.read({postId}, {fields, orderBy});
    }
}
export type CreateCommentRowParam = CommentBaseType & {
    groupId?: number;
};
export type CommentDBResponse = CommentBaseType & {
    id: number;
    createdAt: string;
    groupId: number | null;
    depth: 1 | 2;
    sequence: string;
};
