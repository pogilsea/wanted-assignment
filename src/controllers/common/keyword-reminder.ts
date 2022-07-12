import {IKeywordRepository, KeywordRepository} from '@repositories/keyword';

export interface IKeywordReminder {
    send(): Promise<void>;
}

export class KeywordReminder implements IKeywordReminder {
    text: string;
    keywordRepo: IKeywordRepository;
    constructor(text: string) {
        this.text = text;
        this.keywordRepo = new KeywordRepository();
    }
    async send() {
        const keywords = await this.keywordRepo.readUniqueKeywords();
        const results = keywords.filter(({keyword}) => this.findKeyword(this.text, keyword));
        const users = await this.keywordRepo.readAuthorsByKeywords(results);
        const groups = this.groupByUser(users);
        Object.keys(groups).forEach((key) => {
            this.sendMessage({author: key, keywords: groups[key]});
        });
    }
    protected sendMessage(user: {author: string; keywords: string[]}) {
        const {author, keywords} = user;
        let keywordString = this.getKeywordString(keywords);
        const message = `${keywordString} 키워드 게시글이 등록되었습니다.`;
        console.log('send to: ', author);
        console.log('send message: ', message);
    }
    protected findKeyword = (text: string, searchKeyword: string) => {
        if (!text) {
            return '';
        }
        const message = text.split(' ');
        return message.some((word) => word.startsWith(searchKeyword));
    };
    protected getKeywordString(keywords: string[]) {
        let keywordString = keywords[0];
        if (keywords.length > 1) {
            keywordString = keywordString + `외 ${keywordString.length - 1}건`;
        }
        return keywordString;
    }
    protected groupByUser(arr: KeywordRemindParam[]) {
        return arr.reduce((prev: any, next) => {
            (prev[next.author] = prev[next.author] || []).push(next.keyword);
            return prev;
        }, {});
    }
}

export type KeywordRemindParam = {author: string; keyword: string};
