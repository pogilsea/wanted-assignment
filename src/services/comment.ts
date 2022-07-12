import {CommentValidator, CreateCommentRequestParam, ICommentValidator, ReadCommentRequestParam} from '@controllers/comment';
import {CommentDBResponse, CommentRepository, ICommentRepository} from '@repositories/comment';
import {KeywordReminder} from '@controllers/common';
import {IPostDataHelper, PostDataHelper} from '@controllers/post';

export interface ICommentService {
    createComment(param: CreateCommentRequestParam): Promise<void>;
    readCommentList(param: ReadCommentRequestParam): Promise<CommentDBResponse[]>;
}

export class CommentService implements ICommentService {
    private validator: ICommentValidator;
    private repository: ICommentRepository;
    private dataHelper: IPostDataHelper;
    constructor() {
        this.validator = new CommentValidator();
        this.repository = new CommentRepository();
        this.dataHelper = new PostDataHelper();
    }
    async createComment(param: CreateCommentRequestParam) {
        // parameter validation
        await this.validator.create(param);
        // 댓글 DB Row 생성
        await this.repository.create(param);
        // 키워드 리만인드 알림 호출
        new KeywordReminder(param.content).send();
    }
    async readCommentList(param: ReadCommentRequestParam) {
        const {postId} = param;
        this.dataHelper.setLimitPropertyToNumber(param);
        // parameter validation
        await this.validator.read(param);
        // 댓글 DB Rows 호출
        return this.repository.readByPostId(postId);
    }
}
