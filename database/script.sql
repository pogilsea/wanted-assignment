create table wanted.keyword
(
    id        int auto_increment
        primary key,
    author    varchar(255)                       not null comment '유저 이름',
    keyword   varchar(255)                       not null comment '키워드명',
    createdAt datetime default CURRENT_TIMESTAMP not null comment '등록 시간'
)
    comment '키워드 알림용 테이블';

create index author_name_uindex
    on wanted.keyword (author);

create index keyword_keyword_index
    on wanted.keyword (keyword);

create table wanted.post
(
    id        int auto_increment
        primary key,
    title     text                               null,
    content   text                               null,
    author    varchar(255)                       not null comment '작성자 이름',
    encrypted char(12)                           not null comment '비밀번호 해시',
    iv        char(32)                           not null comment '비밀번호 암호화 초기화 벡터',
    updatedAt datetime                           null comment '수정시간',
    createdAt datetime default CURRENT_TIMESTAMP not null comment '작성시간'
)
    comment '게시글';

create table wanted.comment
(
    id        int auto_increment
        primary key,
    author    varchar(255)                       not null comment '작성자',
    postId    int                                null comment '게시글 아이디',
    groupId   int                                null comment '댓글 그룹 아이디:
댓글과 그의 대댓글은 같은 그룹',
    content   text                               not null comment '댓글 내용',
    sequence  int                                not null comment '댓글 그룹내 순번',
    depth     tinyint  default 1                 not null comment '댓글 뎁스에 따른 타입
1: 댓글, 2:대댓글',
    createdAt datetime default CURRENT_TIMESTAMP not null comment '작성시간',
    constraint comment_post_id_fk
        foreign key (postId) references wanted.post (id)
)
    comment '게시판 댓글';

create index comment_groupId_index
    on wanted.comment (groupId);

create index post_author_index
    on wanted.post (author);

create fulltext index title
    on wanted.post (title);