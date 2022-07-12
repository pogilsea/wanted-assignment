import {OkPacket} from 'mysql';
import {GetQueryPropertyType, IMySQLWrapper, MySQLWrapper} from '@utils/mysql-wrapper';
import {ConditionType} from '@utils/query-builder';

export interface ICommentBaseRepository extends IMySQLWrapper {
    insert(data: Partial<CommentTableSchemaType>): Promise<OkPacket>;
    readOne(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType): Promise<any>;
    read(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType): Promise<any[]>;
    remove(keyObject: Partial<CommentTableKeyType>): Promise<OkPacket>;
    count(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType): Promise<number>;
    updateOne(keyObject: Partial<CommentTableKeyType>, data: Partial<CommentTableSchemaType>): Promise<OkPacket>;
}
export class CommentBaseRepository extends MySQLWrapper implements ICommentBaseRepository {
    constructor() {
        super({tableName: 'comment', tableShort: 'cmt'});
    }
    insert(data: Partial<CommentTableSchemaType>, onDuplicate?: string[]) {
        return this._insert(data, {onDuplicate});
    }
    remove(keyObject: Partial<CommentTableKeyType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._delete(conditions);
    }
    updateOne(keyObject: Partial<CommentTableKeyType>, data: Partial<CommentTableSchemaType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._update(conditions, data);
    }
    read(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType) {
        let conditions = this.getKeyConditions(keyObject);
        if (opt && opt.conditions) {
            conditions = conditions.concat(opt.conditions);
        }
        return this._get<any>(conditions, {...opt});
    }
    readOne(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._getOne<any>(conditions, {...opt});
    }
    count(keyObject: Partial<CommentTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._count(conditions);
    }
    protected getKeyConditions(query: Partial<CommentTableKeyType>) {
        let conditions: ConditionType[] = [];
        const {commentId, groupId, postId} = query;
        if (commentId) {
            conditions.push({fieldName: 'cmt.id', value: commentId});
        }
        if (groupId) {
            conditions.push({fieldName: 'cmt.groupId', value: groupId});
        }
        if (postId) {
            conditions.push({fieldName: 'cmt.postId', value: postId});
        }
        return conditions;
    }
}

export type CommentBaseType = {
    author: string;
    postId: number;
    content: string;
};
export type CommentTableKeyType = {
    commentId: number;
    groupId: number;
    postId: number;
};
export type CommentTableSchemaType = CommentBaseType & {
    id: number;
    groupId: number;
    sequence: number | string;
    depth: number;
    createdAt: string;
};
