import {OkPacket} from 'mysql';
import {GetQueryPropertyType, IMySQLWrapper, MySQLWrapper} from '@utils/mysql-wrapper';
import {ConditionType} from '@utils/query-builder';

export interface IKeywordBaseRepository extends IMySQLWrapper {
    insert(data: Partial<KeywordTableSchemaType>, onDuplicate?: string[]): Promise<OkPacket>;
    readOne(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType): Promise<any>;
    read(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType): Promise<any[]>;
    remove(keyObject: Partial<KeywordTableKeyType>): Promise<OkPacket>;
    count(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType): Promise<number>;
    updateOne(keyObject: Partial<KeywordTableKeyType>, data: Partial<KeywordTableSchemaType>): Promise<OkPacket>;
}
export class KeywordBaseRepository extends MySQLWrapper implements IKeywordBaseRepository {
    constructor() {
        super({tableName: 'keyword', tableShort: 'kw'});
    }
    insert(data: Partial<KeywordTableSchemaType>, onDuplicate?: string[]) {
        let ignore = false;
        if (!onDuplicate) {
            ignore = true;
        }
        return this._insert(data, {ignore, onDuplicate});
    }
    remove(keyObject: Partial<KeywordTableKeyType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._delete(conditions);
    }
    updateOne(keyObject: Partial<KeywordTableKeyType>, data: Partial<KeywordTableSchemaType>) {
        const conditions = this.getKeyConditions(keyObject);
        return this._update(conditions, data);
    }
    read(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType) {
        let conditions = this.getKeyConditions(keyObject);
        if (opt && opt.conditions) {
            conditions = conditions.concat(opt.conditions);
        }
        return this._get<any>(conditions, {...opt});
    }
    readOne(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._getOne<any>(conditions, {...opt});
    }
    count(keyObject: Partial<KeywordTableKeyType>, opt?: GetQueryPropertyType) {
        const conditions = this.getKeyConditions(keyObject);
        return this._count(conditions);
    }
    protected getKeyConditions(query: Partial<KeywordTableKeyType>) {
        let conditions: ConditionType[] = [];
        const {keyword, keywordId} = query;
        if (keyword) {
            conditions.push({fieldName: 'kw.keyword', value: keyword});
        }
        if (keywordId) {
            conditions.push({fieldName: 'kw.id', value: keywordId});
        }
        return conditions;
    }
}

export type KeywordTableKeyType = {
    keywordId: number;
    keyword: string;
};
export type KeywordTableSchemaType = {
    id: number;
    author: string;
    keyword: string;
    createdAt: string;
};
