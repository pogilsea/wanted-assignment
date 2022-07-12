import {
    CreatePostRequestParam,
    ReadPostRequestParam,
    UpdatePostRequestParam,
    DeletePostRequestParam,
    PostDataHelper,
    IPostDataHelper,
    PostValidator,
    IPostValidator,
} from '@controllers/post';
import {IPasswordCrypto, KeywordReminder, PasswordCrypto} from '@controllers/common';
import {IPostRepository, PostDBRowResponse, PostRepository} from '@repositories/post';
import {IKeywordRepository, KeywordRepository} from '@repositories/keyword';

export interface IPostService {
    create(param: CreatePostRequestParam): Promise<void>;
    update(param: UpdatePostRequestParam): Promise<void>;
    read(param: ReadPostRequestParam): Promise<PostDBRowResponse[]>;
    delete(param: DeletePostRequestParam): Promise<void>;
}

export class PostService implements IPostService {
    private validator: IPostValidator;
    private dataHelper: IPostDataHelper;
    private repository: IPostRepository;
    private passwordCrypto: IPasswordCrypto;
    private keywordRepo: IKeywordRepository;
    constructor() {
        this.validator = new PostValidator();
        this.dataHelper = new PostDataHelper();
        this.repository = new PostRepository();
        this.keywordRepo = new KeywordRepository();
        this.passwordCrypto = new PasswordCrypto();
    }
    async create(param: CreatePostRequestParam) {
        // parameter validation
        const {password, ...data} = param;
        this.validator.create(param);
        // 비밀번호 암호화
        const {iv, encrypted} = this.passwordCrypto.encrypt(password);
        // 게시글 DB Row 생성
        await this.repository.createPost({...data, iv, encrypted});
        // 키워드 리만인드 알림 호출
        new KeywordReminder(data.content).send();
    }
    async read(param: ReadPostRequestParam) {
        this.dataHelper.setLimitPropertyToNumber(param);
        // parameter validation
        this.validator.read(param);
        // 게시글 DB Rows 호출
        return this.repository.readAllPostList(param);
    }
    async update(param: UpdatePostRequestParam) {
        // parameter validation
        await this.validator.update(param);
        const {password, ...data} = param;
        //게시글 DB Row 변경
        await this.repository.updatePost(data);
    }
    async delete(param: DeletePostRequestParam) {
        // parameter validation
        await this.validator.delete(param);
        //게시글 DB row 삭제
        await this.repository.deletePost(param.id);
    }
}
