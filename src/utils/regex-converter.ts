export interface IRegexConverter {
    textOnly(text?: string | null): string;
}

export class RegexConverter implements IRegexConverter {
    textOnly = (text?: string | null) => {
        if (!text) {
            return '';
        }
        let check_kor = /[^a-zA-Zㄱ-힣\u119E\u11A2]/gi;
        return text.replace(check_kor, '');
    };
}
