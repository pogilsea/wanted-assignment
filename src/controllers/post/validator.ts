import {CreatePostRequestParam, DeletePostRequestParam, ReadPostRequestParam, UpdatePostRequestParam} from '@controllers/post/entity';
import {IPostValidateHelper, PostValidateHelper} from '@controllers/post/validate-helper';
import {BaseValidator, IBaseValidator} from '@utils/base-validator';
import {IPostRepository, PostRepository} from '@repositories/post';

export interface IPostValidator extends IBaseValidator {
    create(param: CreatePostRequestParam): void;
    update(param: UpdatePostRequestParam): Promise<void>;
    read(param: ReadPostRequestParam): void;
    delete(param: DeletePostRequestParam): Promise<void>;
}

export class PostValidator extends BaseValidator implements IPostValidator {
    validateHelper: IPostValidateHelper;
    postRepo: IPostRepository;
    constructor() {
        super();
        this.validateHelper = new PostValidateHelper();
        this.postRepo = new PostRepository();
    }
    create(param: CreatePostRequestParam) {
        try {
            this.execute(RequestParamSchema.Create, param);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }
    read(param: ReadPostRequestParam) {
        try {
            this.execute(RequestParamSchema.Read, param);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }
    async update(param: UpdatePostRequestParam) {
        try {
            const {id, password} = param;
            this.execute(RequestParamSchema.Update, param);
            const post = await this.postRepo.readOne({postId: id}, {fields: ['iv', 'encrypted']});
            this.validateHelper.assertPostExist(post);
            this.validateHelper.assertPasswordCorrect(password, post.iv, post.encrypted);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }

    async delete(param: DeletePostRequestParam) {
        try {
            const {id, password} = param;
            this.execute(RequestParamSchema.Delete, param);
            const post = await this.postRepo.readOne({postId: id}, {fields: ['iv', 'encrypted']});
            this.validateHelper.assertPostExist(post);
            this.validateHelper.assertPasswordCorrect(password, post.iv, post.encrypted);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }

    protected setErrorMessage(err: any) {
        switch (this.keyword) {
            case 'minLength':
                err.message = this.getMinLengthErrorMessage();
                break;
            case 'maxLength':
                err.message = this.getMaxLengthErrorMessage();
                break;
            case 'required':
                err.message = this.getRequiredErrorMessage();
                break;
            case 'type':
                err.message = this.getTypeErrorMessage();
                break;
            default:
                break;
        }
    }
    protected getMinLengthErrorMessage() {
        const property = this.notAllowedTypeProperty;
        if (!property) {
            return 'Bad Request';
        }
        const limitText = this.params.limit;
        return `RequestBody ??????(${property})??? ?????? ${limitText}?????? ???????????? ???????????? ?????????`;
    }
    protected getMaxLengthErrorMessage() {
        if (!this.notAllowedTypeProperty) {
            return 'Bad Request';
        }
        const limitText = this.params.limit;
        const property = this.notAllowedTypeProperty;
        return `RequestBody ??????(${property})??? ?????? ${limitText}?????? ???????????? ???????????? ?????????`;
    }
    protected getRequiredErrorMessage() {
        switch (this.missingProperty) {
            case 'password':
                return '???????????? ???(password)??? ???????????? ????????????.';
            case 'id':
                return '????????? ????????? ???(id)??? ???????????? ????????????.';
            case 'title':
                return '?????? ???(title)??? ???????????? ????????????.';
            case 'content':
                return '?????? ?????? ???(content)??? ???????????? ????????????.';
            default:
                break;
        }
    }
    protected getTypeErrorMessage() {
        const type = this.params.type;
        switch (this.notAllowedTypeProperty) {
            case 'password':
                return `???????????? ???(password)??? ????????? ???????????? ????????????.(allowed type: ${type})`;
            case 'id':
                return `????????? ????????? ???(id)??? ????????? ???????????? ????????????.(allowed type: ${type})`;
            case 'title':
                return `?????? ???(title)??? ????????? ???????????? ????????????.(allowed type: ${type})`;
            case 'content':
                return `?????? ?????? ???(content)??? ????????? ???????????? ????????????.(allowed type: ${type})`;
            default:
                break;
        }
    }
}
const RequestParamSchema = {
    Create: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'content', 'author', 'password'],
        properties: {
            title: {type: 'string', minLength: 1},
            content: {type: 'string', minLength: 1},
            author: {type: 'string', minLength: 1},
            password: {type: 'string', minLength: 6, maxLength: 10},
        },
    },
    Update: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'password'],
        properties: {
            id: {type: 'number', minLength: 1},
            title: {type: 'string', minLength: 1},
            content: {type: 'string', minLength: 1},
            author: {type: 'string', minLength: 1},
            password: {type: 'string', minLength: 6, maxLength: 10},
        },
    },
    Read: {
        type: 'object',
        additionalProperties: false,
        properties: {
            limit: {type: 'number', default: 100},
            offset: {type: 'number', default: 0},
            searchProperty: {type: 'string'},
            searchValue: {type: 'string'},
        },
    },

    Delete: {
        type: 'object',
        additionalProperties: false,
        required: ['id', 'password'],
        properties: {
            id: {type: 'number', minLength: 1},
            password: {type: 'string', minLength: 6, maxLength: 10},
        },
    },
};
