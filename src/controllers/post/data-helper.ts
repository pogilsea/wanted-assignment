import {ReadPostRequestParam} from '@controllers/post/entity';

export interface IPostDataHelper {
    setLimitPropertyToNumber(param: ReadPostRequestParam): void;
}
export class PostDataHelper implements IPostDataHelper {
    setLimitPropertyToNumber(param: ReadPostRequestParam) {
        if (!param.limit) {
            return;
        }
        param.limit = Number(param.limit);
        param.offset = Number(param.offset || 0);
    }
}
