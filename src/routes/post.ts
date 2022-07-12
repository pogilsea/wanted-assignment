import {NextFunction, Request, Response} from 'express';
import {BaseRouteHandler} from '@utils/base-route';
import {IPostService, PostService} from '@services/post';
import {CommentService, ICommentService} from '@services/comment';

interface IPostRouteHandler {
    createPost(req: Request, res: Response, next: NextFunction): void;
    updatePost(req: Request, res: Response, next: NextFunction): void;
    deletePost(req: Request, res: Response, next: NextFunction): void;
    readPostList(req: Request, res: Response, next: NextFunction): void;
    createComment(req: Request, res: Response, next: NextFunction): void;
    readCommentList(req: Request, res: Response, next: NextFunction): void;
}

export class PostRouteHandler extends BaseRouteHandler implements IPostRouteHandler {
    postService: IPostService;
    commentService: ICommentService;
    constructor() {
        super();
        this.postService = new PostService();
        this.commentService = new CommentService();
        this.setRouterPath();
    }
    private setRouterPath() {
        this.router.post('/posts', this.createPost.bind(this));
        this.router.put('/posts/:id', this.updatePost.bind(this));
        this.router.post('/posts/delete/:id', this.deletePost.bind(this));
        this.router.get('/posts', this.readPostList.bind(this));
        this.router.post('/posts/:postId/comments', this.createComment.bind(this));
        this.router.get('/posts/:postId/comments', this.readCommentList.bind(this));
    }

    // 게시글 작성
    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const param = req.body;
            console.log('request param', param);
            await this.postService.create(param);
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }
    // 게시글 수정
    async updatePost(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const param = {...req.body, id};
            console.log('request param', param);
            await this.postService.update(param);
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }
    // 게시글 삭제
    async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const id = Number(req.params.id);
            const param = {...req.body, id};
            console.log('request param', param);
            await this.postService.delete(param);
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }
    // 게시글 조회
    async readPostList(req: Request, res: Response, next: NextFunction) {
        try {
            const param = req.query;
            console.log('request param', param);
            const data = await this.postService.read(param);
            return res.send({responseCode: 200, resultMessage: 'Success', data});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }
    // 댓글 작성
    async createComment(req: Request, res: Response, next: NextFunction) {
        try {
            const postId = Number(req.params.postId);
            const param = {...req.body, postId};
            console.log('createComment request param', param);
            await this.commentService.createComment(param);
            // HTTP 응답값 처리
            return res.send({responseCode: 200, resultMessage: 'Success'});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }

    // 댓글 조회
    async readCommentList(req: Request, res: Response, next: NextFunction) {
        try {
            const postId = Number(req.params.postId);
            const param = {...req.query, postId};
            console.log('request param', param);
            const data = await this.commentService.readCommentList(param);
            return res.send({responseCode: 200, resultMessage: 'Success', data});
        } catch (err) {
            return this.errorHandler(err, next);
        }
    }
}
