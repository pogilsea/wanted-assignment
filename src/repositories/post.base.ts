import {OkPacket} from 'mysql';
import {GetQueryPropertyType, IMySQLWrapper, MySQLWrapper} from '@utils/mysql-wrapper';
import {ConditionType} from '@utils/query-builder';

export interface IPostBaseRepository extends IMySQLWrapper {
    insert(data: Partial<PostTableSchemaType>): Promise<OkPacket>;
    readOne(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType): Promise<any>;
    read(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType): Promise<any[]>;
    count(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType): Promise<number>;
    remove(keyObject: Partial<PostTableKeyType>): Promise<OkPacket>;
    updateOne(keyObject: Partial<PostTableKeyType>, param: Partial<PostTableSchemaType>): Promise<OkPacket>;
}
export class PostBaseRepository extends MySQLWrapper implements IPostBaseRepository {
    constructor() {
        super({tableName: 'post', tableShort: 'po'});
    }
    insert(data: Partial<PostTableSchemaType>, onDuplicate?: string[]) {
        let ignore = false;
        if (!onDuplicate) {
            ignore = true;
        }
        return this._insert(data, {ignore, onDuplicate});
    }
    remove(keyObject: Partial<PostTableKeyType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._delete(conditions);
    }
    updateOne(keyObject: Partial<PostTableKeyType>, param: Partial<PostTableSchemaType>) {
        const conditions = this.getKeyConditions(keyObject);
        const updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        return this._update(conditions, {...param, updatedAt});
    }
    read(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType) {
        let conditions = this.getKeyConditions(keyObject);
        if (opt && opt.conditions) {
            conditions = conditions.concat(opt.conditions);
        }
        return this._get<any>(conditions, {...opt});
    }
    readOne(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._getOne<any>(conditions, {...opt});
    }
    count(keyObject: Partial<PostTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._count(conditions);
    }
    protected getKeyConditions(query: Partial<PostTableKeyType>) {
        let conditions: ConditionType[] = [];
        const {postId, author, title} = query;
        if (postId) {
            conditions.push({fieldName: 'po.id', value: postId});
        }
        if (author) {
            const lastChar = author.substring(author.length - 1);
            if (lastChar === '%') {
                conditions.push({fieldName: 'po.author', value: author, operator: 'LIKE'});
            } else {
                conditions.push({fieldName: 'po.author', value: author});
            }
        }
        if (title) {
            const lastChar = title.substring(title.length - 1);
            if (lastChar === '*') {
                conditions.push({fieldName: 'po.title', value: title, operator: 'fulltext', booleanMode: true});
            } else {
                conditions.push({fieldName: 'po.title', value: title});
            }
        }
        return conditions;
    }
}

export type PostCommonType = {
    title: string;
    content: string;
    author: string;
};

export type PostTableKeyType = {
    postId: number;
    author: string;
    title: string;
};
export type PostTableSchemaType = PostCommonType & {
    id: number;
    iv: string;
    encrypted: string;
    updatedAt: string;
    createdAt: string;
};
