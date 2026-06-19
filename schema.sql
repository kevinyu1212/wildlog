-- WildLog MySQL Schema

CREATE DATABASE IF NOT EXISTS wildlog;
USE wildlog;

-- 1. 유저 테이블
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    birthday DATE NULL,
    security_question VARCHAR(255) NULL,
    security_answer VARCHAR(255) NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    records INT DEFAULT 0,
    species INT DEFAULT 0,
    comments INT DEFAULT 0,
    likes INT DEFAULT 0,
    profile_image TEXT
);

-- 2. 게시판 테이블
CREATE TABLE IF NOT EXISTS boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- 초기 게시판 데이터
INSERT IGNORE INTO boards (id, name, slug) VALUES 
(1, '포유류', '포유류'),
(2, '파충류', '파충류'),
(3, '양서류', '양서류'),
(4, '절지류', '절지류'),
(5, '곤충', '곤충'),
(6, '어류', '어류'),
(7, '식물', '식물'),
(8, '균류', '균류'),
(9, '기타', '기타');

-- 3. 게시글 테이블
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    board_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    category VARCHAR(255),
    images TEXT, 
    lat DOUBLE,
    lng DOUBLE,
    mission_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(board_id) REFERENCES boards(id)
);

-- 4. 댓글 테이블
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    parent_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- 5. 좋아요 테이블
CREATE TABLE IF NOT EXISTS post_likes (
    user_id INT,
    post_id INT,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
);

-- 6. 미션 테이블
CREATE TABLE IF NOT EXISTS missions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(255),
    tags TEXT,
    reward VARCHAR(255),
    target_count INT DEFAULT 100,
    current_count INT DEFAULT 0,
    image TEXT,
    created_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME
);

-- 7. 알림 테이블
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    sender_id INT,
    post_id INT,
    type VARCHAR(50), -- 'like', 'comment', 'reply', 'mission'
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- 8. 즐겨찾기 테이블
CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    post_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
);

-- 초기 미션 데이터
-- INSERT IGNORE INTO missions (id, title, description, target_count, current_count) VALUES 
-- (1, '지리산 반달곰 흔적 찾기', '지리산 일대의 반달가슴곰 서식 흔적을 기록해주세요.', 100, 65);
