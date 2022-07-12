import {CreateCommentRequestParam, ReadCommentRequestParam} from '@controllers/comment/entity';
import {BaseValidator, IBaseValidator} from '@utils/base-validator';
import {CommentRepository, ICommentRepository} from '@repositories/comment';
import {IPostRepository, PostRepository} from '@repositories/post';
import {CommentValidateHelper, ICommentValidateHelper} from '@controllers/comment/validate-helper';

export interface ICommentValidator extends IBaseValidator {
    create(param: CreateCommentRequestParam): void;
    read(param: ReadCommentRequestParam): void;
}

export class CommentValidator extends BaseValidator implements ICommentValidator {
    validateHelper: ICommentValidateHelper;
    commentRepo: ICommentRepository;
    postRepo: IPostRepository;
    constructor() {
        super();
        this.commentRepo = new CommentRepository();
        this.postRepo = new PostRepository();
        this.validateHelper = new CommentValidateHelper();
    }
    async create(param: CreateCommentRequestParam) {
        try {
            const {groupId, postId} = param;
            this.execute(RequestParamSchema.Create, param);
            const post = await this.postRepo.readOne({postId});
            this.validateHelper.assertPostExist(post);
            if (!groupId) {
                return;
            }
            const comment = await this.commentRepo.readOne({commentId: groupId});
            this.validateHelper.assertCommentExist(comment);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }
    read(param: ReadCommentRequestParam) {
        try {
            this.execute(RequestParamSchema.Read, param);
        } catch (err) {
            this.setErrorMessage(err);
            throw err;
        }
    }
    protected setErrorMessage = (err: any) => {
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
    };
    protected getMinLengthErrorMessage = () => {
        const property = this.notAllowedTypeProperty;
        if (!property) {
            return 'Bad Request';
        }
        const limitText = this.params.limit;
        return `RequestBody 필드(${property})는 최소 ${limitText}글자 이상으로 입력해야 합니다`;
    };
    protected getMaxLengthErrorMessage = () => {
        if (!this.notAllowedTypeProperty) {
            return 'Bad Request';
        }
        const limitText = this.params.limit;
        const property = this.notAllowedTypeProperty;
        return `RequestBody 필드(${property})는 최대 ${limitText}글자 이하으로 입력해야 합니다`;
    };
    protected getRequiredErrorMessage = () => {
        switch (this.missingProperty) {
            case 'id':
                return '댓글 아이디 값(id)이 존재하지 않습니다.';
            case 'postId':
                return '게시글 아이디 값(postId)이 존재하지 않습니다.';
            case 'content':
                return '댓글 내용 값(content)이 존재하지 않습니다.';
            default:
                break;
        }
    };
    protected getTypeErrorMessage = () => {
        const type = this.params.type;
        switch (this.notAllowedTypeProperty) {
            case 'id':
                return `댓글 아이디 값(id)의 타입이 올바르지 않습니다.(allowed type: ${type})`;
            case 'postId':
                return `게시글 아이디 값(postId)의 타입이 올바르지 않습니다.(allowed type: ${type})`;
            case 'content':
                return `댓글 내용 값(content)의 타입이 올바르지 않습니다.(allowed type: ${type})`;
            default:
                break;
        }
    };
}
const RequestParamSchema = {
    Create: {
        type: 'object',
        additionalProperties: false,
        required: ['content', 'author', 'postId'],
        properties: {
            content: {type: 'string', minLength: 1},
            author: {type: 'string', minLength: 1},
            postId: {type: 'number'},
            groupId: {type: 'number'},
        },
    },

    Read: {
        type: 'object',
        additionalProperties: false,
        required: ['postId'],
        properties: {
            postId: {type: 'number'},
            limit: {type: 'number', default: 100},
            offset: {type: 'number', default: 0},
        },
    },
};
