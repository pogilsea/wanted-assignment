import {OkPacket} from 'mysql';
import createError from 'http-errors';
import {ConditionType, JoinType, QueryBuilder, UpdateQuerySet} from './query-builder';
import {MySQLConnection} from './mysql-connector';
import {HTTP_RESPONSE_CODE} from '@utils/error-code';

export interface IMySQLWrapper {
    _insert<T>(param: T, opt?: {onDuplicate?: string[]; ignore?: boolean}): Promise<OkPacket>;
    _insertBulk<T>(param: T[], opt?: {onDuplicate?: string[]}): Promise<OkPacket>;
    _get<T>(conditions: ConditionType[], opt?: GetQueryPropertyType): Promise<T[]>;
    _getOne<T>(conditions: ConditionType[], opt?: GetQueryPropertyType): Promise<T>;
    _update<T>(conditions: ConditionType[], param: T, opt?: GetQueryPropertyType): Promise<OkPacket>;
    _updateMaths<T>(conditions: ConditionType[], param: UpdateQuerySet[]): Promise<OkPacket>;
    _delete(conditions: ConditionType[]): Promise<OkPacket>;
    _count(conditions: ConditionType[]): Promise<number>;
}

export class MySQLWrapper implements IMySQLWrapper {
    tableName: string;
    tableShort?: string;
    queryBuilder;
    constructor(param: {tableName: string; tableShort?: string}) {
        this.tableName = param.tableName;
        this.tableShort = param.tableShort;
        this.queryBuilder = new QueryBuilder();
    }

    _insert(param: any, opt?: {onDuplicate?: string[]; ignore?: boolean}): Promise<OkPacket> {
        this.queryBuilder.insert(this.tableName, opt && opt.ignore).values(param);
        this.setOnDuplicateProperty(opt);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().queryWrite(finalStatement);
    }

    _insertBulk<T>(param: T[], opt?: {onDuplicate?: string[]}): Promise<OkPacket> {
        this.queryBuilder.insert(this.tableName).arrayValues(param);
        this.setOnDuplicateProperty(opt);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().queryWrite(finalStatement);
    }

    _update<T>(conditions: ConditionType[], param: T, opt?: GetQueryPropertyType): Promise<OkPacket> {
        this.queryBuilder.update(this.tableName, this.tableShort).setMultiple(param);
        this.setConditionBuilder(conditions);
        this.setUpdateQueryPropertyBuilder(opt);
        this.asserCondition(conditions);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().queryWrite(finalStatement);
    }

    _updateMaths<T>(conditions: ConditionType[], param: UpdateQuerySet[]): Promise<OkPacket> {
        this.queryBuilder.update(this.tableName, this.tableShort).setMathMultiple(param);
        this.setConditionBuilder(conditions);
        this.asserCondition(conditions);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().queryWrite(finalStatement);
    }

    _delete(conditions: ConditionType[]): Promise<OkPacket> {
        this.queryBuilder.delete(this.tableName, this.tableShort);
        this.setConditionBuilder(conditions);
        this.asserCondition(conditions);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().queryWrite(finalStatement);
    }

    _get<T>(conditions: ConditionType[], opt?: GetQueryPropertyType): Promise<T[]> {
        this.queryBuilder.select(this.tableName, this.tableShort);
        this.setConditionBuilder(conditions);
        this.setGetQueryPropertyBuilder(opt);
        this.asserCondition(conditions, opt);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        return MySQLConnection.getInstance().query<T>(finalStatement);
    }

    async _getOne<T>(conditions: ConditionType[], opt?: GetQueryPropertyType): Promise<T> {
        this.queryBuilder.select(this.tableName, this.tableShort);
        this.setConditionBuilder(conditions);
        this.setGetQueryPropertyBuilder(opt);
        this.asserCondition(conditions, opt);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        let getRes = await MySQLConnection.getInstance().query<T>(finalStatement);
        return getRes[0];
    }

    async _count(conditions: ConditionType[]): Promise<number> {
        this.queryBuilder.select(this.tableName, this.tableShort).getAs('COUNT(*) as count');
        this.setConditionBuilder(conditions);
        this.asserCondition(conditions);
        let finalStatement = this.queryBuilder.build().returnString();
        this.queryBuilder.reset();
        let getRes = await MySQLConnection.getInstance().query<{count: number}>(finalStatement);
        return getRes[0].count;
    }

    protected setConditionBuilder(conditions: ConditionType[]) {
        let orConditions = conditions.filter((item) => item.or);
        let andConditions = conditions.filter((item) => !item.or);
        orConditions.forEach((condition, index) => {
            if (orConditions.length === 1) {
                this.queryBuilder.where(condition);
            } else {
                if (index > 0 && condition.isNewOrGroup) {
                    this.queryBuilder.whereOr(condition);
                } else {
                    this.queryBuilder.whereOr(condition);
                }
            }
        });
        andConditions.forEach((condition) => {
            if (condition.operator === 'fulltext') {
                this.queryBuilder.whereMatch(condition);
            } else {
                this.queryBuilder.where(condition);
            }
        });
    }
    protected setOnDuplicateProperty(opt?: {onDuplicate?: string[]}) {
        if (!opt || !opt.onDuplicate) {
            return;
        }
        opt.onDuplicate.forEach((fieldName) => {
            this.queryBuilder.onDuplicate(fieldName);
        });
    }
    protected setJoinQuery(opt: GetQueryPropertyType) {
        if (!opt.join) {
            return;
        }
        opt.join.forEach((join) => {
            this.queryBuilder.join(join.tableName, join.column1, '=', join.column2, join.tableShort, join.condition);
        });
    }
    protected setLeftJoinProperty(opt: GetQueryPropertyType) {
        if (!opt.leftJoin) {
            return;
        }
        opt.leftJoin.forEach((join) => {
            this.queryBuilder.leftJoin(join.tableName, join.column1, '=', join.column2, join.tableShort, join.condition);
        });
    }
    protected setFieldsProperty(opt?: GetQueryPropertyType) {
        if (!opt || !opt.fields) {
            this.queryBuilder.get('*');
            return;
        }
        opt.fields.forEach((field) => {
            this.queryBuilder.getAs(field);
        });
    }
    protected setOrderByProperty(opt: GetQueryPropertyType) {
        if (!opt.orderBy) {
            return;
        }
        opt.orderBy.forEach((item) => {
            this.queryBuilder.orderBy(item.fieldName, item.sort);
        });
    }
    protected setGroupByProperty(opt: GetQueryPropertyType) {
        if (!opt.groupBy) {
            return;
        }
        opt.groupBy.forEach((field) => {
            this.queryBuilder.groupBy(field);
        });
    }
    protected setHavingProperty(opt: GetQueryPropertyType) {
        if (!opt.having) {
            return;
        }
        opt.having.forEach((condition) => {
            this.queryBuilder.having(condition.fieldName, condition.operator ? condition.operator : '=', condition.value);
        });
    }
    protected setLimitProperty(opt: GetQueryPropertyType) {
        if (!opt.limit) {
            return;
        }
        if (!opt.offset) {
            opt.offset = 0;
        }
        this.queryBuilder.limit(opt.limit, opt.offset);
    }
    protected setUpdateLimitProperty(opt: GetQueryPropertyType) {
        if (!opt.limit) {
            return;
        }
        this.queryBuilder.updateLimit(opt.limit);
    }
    protected asserCondition(conditions: ConditionType[], opt?: GetQueryPropertyType) {
        if (conditions.length < 1 && (!opt || !opt.noCondition)) {
            throw createError(HTTP_RESPONSE_CODE.BAD_REQUEST, 'Bad Request', {
                query: this.queryBuilder.build().returnString(),
                reason: 'query filter condition is not defined',
            });
        }
    }
    protected setGetQueryPropertyBuilder = (opt?: GetQueryPropertyType) => {
        this.setFieldsProperty(opt);
        if (!opt) {
            return;
        }
        this.setLeftJoinProperty(opt);
        this.setJoinQuery(opt);
        this.setOrderByProperty(opt);
        this.setGroupByProperty(opt);
        this.setHavingProperty(opt);
        this.setLimitProperty(opt);
    };
    protected setUpdateQueryPropertyBuilder = (opt?: GetQueryPropertyType) => {
        if (!opt) {
            return;
        }
        this.setLeftJoinProperty(opt);
        this.setJoinQuery(opt);
        this.setOrderByProperty(opt);
        this.setUpdateLimitProperty(opt);
    };
}

export type GetQueryPropertyType = Partial<{
    fields: string[];
    orderBy: {fieldName: string; sort: string}[];
    leftJoin: JoinType[];
    join: JoinType[];
    limit: number | null;
    offset: number | null;
    groupBy: string[];
    having: ConditionType[];
    noCondition: boolean;
    conditions: ConditionType[];
}>;
