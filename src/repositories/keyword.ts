import {IKeywordBaseRepository, KeywordBaseRepository} from '@repositories/keyword.base';
import {KeywordRemindParam} from '@controllers/common/keyword-reminder';

export interface IKeywordRepository extends IKeywordBaseRepository {
    readUniqueKeywords(): Promise<{keyword: string}[]>;
    readAuthorsByKeywords(keywords: {keyword: string}[]): Promise<KeywordRemindParam[]>;
}

export class KeywordRepository extends KeywordBaseRepository implements IKeywordRepository {
    constructor() {
        super();
    }
    async readUniqueKeywords() {
        const fields = ['keyword'];
        const groupBy = ['keyword'];
        return this.read({}, {noCondition: true, groupBy, fields});
    }
    async readAuthorsByKeywords(keywords: {keyword: string}[]) {
        const fields = ['author', 'keyword'];
        const authors = await Promise.all(keywords.map(({keyword}) => this.read({keyword}, {fields})));
        return authors.reduce((prev, next) => prev.concat(next), []);
    }
}
