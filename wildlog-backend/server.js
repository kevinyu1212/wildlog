const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();

app.use(cors());
app.use(express.json());

// 요청 로그 미들웨어 (디버깅용)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) console.log('Body:', req.body);
  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 정적 파일 제공 (빌드된 프론트엔드)
app.use(express.static(path.join(__dirname, '..', 'wildlog-frontend', 'dist')));

const JWT_SECRET = process.env.JWT_SECRET || 'wildlog-secret-key-2026';

// 업로드 폴더 생성
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// MySQL 데이터베이스 연결
let db;

async function connectDB() {
  try {
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'wildlog'
    });
    console.log('✅ MySQL 데이터베이스 연결 성공!');
    await setupDatabase();
  } catch (err) {
    console.error('❌ MySQL 연결 실패:', err.message);
  }
}

async function setupDatabase() {
  // 1. 유저 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS users (
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
    profile_image TEXT,
    points INT DEFAULT 0
  )`);

  // points 컬럼 마이그레이션 (기존 테이블에 추가)
  const [pointsCol] = await db.query("SHOW COLUMNS FROM users LIKE 'points'");
  if (pointsCol.length === 0) {
    await db.query("ALTER TABLE users ADD COLUMN points INT DEFAULT 0 AFTER profile_image");
  }
  
  // 1-0. 포인트 내역 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS point_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    points INT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    reference_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // birthday, security_question, security_answer 컬럼 마이그레이션
  const [birthdayCol] = await db.query("SHOW COLUMNS FROM users LIKE 'birthday'");
  if (birthdayCol.length === 0) {
    await db.query("ALTER TABLE users ADD COLUMN birthday DATE NULL AFTER username");
    await db.query("ALTER TABLE users ADD COLUMN security_question VARCHAR(255) NULL AFTER password");
    await db.query("ALTER TABLE users ADD COLUMN security_answer VARCHAR(255) NULL AFTER security_question");
  }

  // 1-1. 게시판 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL
  )`);

  // 초기 게시판 데이터
  const [boardRows] = await db.query("SELECT COUNT(*) as count FROM boards");
  if (boardRows[0].count === 0) {
    const initialBoards = [
      ['포유류', '포유류'], ['파충류', '파충류'], ['양서류', '양서류'],
      ['절지류', '절지류'], ['곤충', '곤충'], ['어류', '어류'],
      ['식물', '식물'], ['균류', '균류'], ['기타', '기타']
    ];
    for (const board of initialBoards) {
      await db.query("INSERT INTO boards (name, slug) VALUES (?, ?)", board);
    }
  }

  // 2. 게시글 테이블 및 컬럼 추가 (마이그레이션)
  await db.query(`CREATE TABLE IF NOT EXISTS posts (
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
  )`);

  // board_id 컬럼이 없을 경우 추가
  const [columns] = await db.query("SHOW COLUMNS FROM posts LIKE 'board_id'");
  if (columns.length === 0) {
    console.log('--- posts 테이블에 board_id 컬럼 추가 중... ---');
    await db.query("ALTER TABLE posts ADD COLUMN board_id INT AFTER user_id");
    await db.query("ALTER TABLE posts ADD FOREIGN KEY (board_id) REFERENCES boards(id)");
  }

  // category 컬럼의 NOT NULL 제약 조건 해제 (있을 경우)
  await db.query("ALTER TABLE posts MODIFY COLUMN category VARCHAR(255) NULL");

  // 데이터 마이그레이션: category 텍스트를 board_id로 변환
  const [postsWithoutBoardId] = await db.query("SELECT id, category FROM posts WHERE board_id IS NULL AND category IS NOT NULL");
  if (postsWithoutBoardId.length > 0) {
    console.log(`--- ${postsWithoutBoardId.length}개의 게시글 마이그레이션 중... ---`);
    for (const post of postsWithoutBoardId) {
      const [boards] = await db.query("SELECT id FROM boards WHERE name = ?", [post.category]);
      if (boards.length > 0) {
        await db.query("UPDATE posts SET board_id = ? WHERE id = ?", [boards[0].id, post.id]);
      }
    }
  }

  // 3. 댓글 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    parent_id INT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(post_id) REFERENCES posts(id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(parent_id) REFERENCES comments(id) ON DELETE CASCADE
  )`);

  // parent_id 컬럼 확인 및 추가 (마이그레이션)
  const [commentColumns] = await db.query("SHOW COLUMNS FROM comments LIKE 'parent_id'");
  if (commentColumns.length === 0) {
    await db.query("ALTER TABLE comments ADD COLUMN parent_id INT AFTER user_id");
    await db.query("ALTER TABLE comments ADD FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE");
  }

  // 4. 좋아요 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS post_likes (
    user_id INT,
    post_id INT,
    PRIMARY KEY (user_id, post_id)
  )`);

  // 5. 미션 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS missions (
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
  )`);

  const missionColumnsToAdd = [
    { name: 'category', sql: "ALTER TABLE missions ADD COLUMN category VARCHAR(255) NULL AFTER description" },
    { name: 'tags', sql: "ALTER TABLE missions ADD COLUMN tags TEXT NULL AFTER category" },
    { name: 'reward', sql: "ALTER TABLE missions ADD COLUMN reward VARCHAR(255) NULL AFTER tags" },
    { name: 'created_by', sql: "ALTER TABLE missions ADD COLUMN created_by INT NULL AFTER image" },
    { name: 'created_at', sql: "ALTER TABLE missions ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER created_by" }
  ];

  for (const column of missionColumnsToAdd) {
    const [missionCols] = await db.query(`SHOW COLUMNS FROM missions LIKE ?`, [column.name]);
    if (missionCols.length === 0) {
      await db.query(column.sql);
    }
  }

  // 6. 알림 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    sender_id INT,
    post_id INT,
    type VARCHAR(50), -- 'like', 'comment', 'reply'
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // post_id, sender_id 컬럼 추가 (마이그레이션)
  const [notifCols] = await db.query("SHOW COLUMNS FROM notifications LIKE 'post_id'");
  if (notifCols.length === 0) {
    await db.query("ALTER TABLE notifications ADD COLUMN post_id INT AFTER user_id");
    await db.query("ALTER TABLE notifications ADD COLUMN sender_id INT AFTER post_id");
  }

  // 7. 즐겨찾기 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    post_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  )`);

  // 8. 관찰자 즐겨찾기 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS observer_favorites (
    user_id INT,
    target_user_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, target_user_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(target_user_id) REFERENCES users(id)
  )`);

}

// --- 포인트 적립 헬퍼 함수 ---
async function addPoints(userId, points, type, description, referenceId = null) {
  if (!userId || !points) return;
  try {
    await db.query(
      "INSERT INTO point_history (user_id, points, type, description, reference_id) VALUES (?, ?, ?, ?, ?)",
      [userId, points, type, description, referenceId]
    );
    await db.query("UPDATE users SET points = points + ? WHERE id = ?", [points, userId]);
    
    // 포인트 획득 알림 생성 (음수 포인트는 알림 생성 안함)
    if (points > 0) {
      await db.query(
        "INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)",
        [userId, null, referenceId, 'point', `🎉 포인트 ${points}P를 획득했습니다! (${description})`]
      );
    }
  } catch (err) {
    console.error('Failed to add points:', err);
  }
}

// API 호출 시 DB 연결 확인 미들웨어
app.use((req, res, next) => {
  if (!db && req.path.startsWith('/api')) {
    return res.status(503).json({ error: '데이터베이스 연결 중입니다. 잠시 후 다시 시도해주세요.' });
  }
  next();
});

// --- 1. 홈 화면 (Home) ---
app.get('/api/boards', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM boards ORDER BY id ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/home/data', async (req, res) => {
  try {
    const [recentPosts] = await db.query(`
      SELECT p.*, u.username as author, u.profile_image as author_img,
        COALESCE(b.name, p.category) as category,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN boards b ON p.board_id = b.id
      ORDER BY p.created_at DESC
      LIMIT 6
    `);
    const [hotMissions] = await db.query(`
      SELECT * FROM missions
      WHERE end_date IS NULL OR end_date > NOW()
      ORDER BY (current_count / NULLIF(target_count, 0)) DESC, current_count DESC
      LIMIT 1
    `);
    const [topObservers] = await db.query(`
      SELECT u.id, u.username, u.profile_image,
        COUNT(DISTINCT p.title) as species_count,
        COUNT(p.id) as records
      FROM users u
      JOIN posts p ON p.user_id = u.id
      WHERE MONTH(p.created_at) = MONTH(NOW()) AND YEAR(p.created_at) = YEAR(NOW())
      GROUP BY u.id, u.username, u.profile_image
      ORDER BY species_count DESC, records DESC
      LIMIT 3
    `);
    res.json({ recentPosts, hotMission: hotMissions[0] || null, topObservers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. 로그인 및 회원가입 (Login/Auth) ---
app.get('/api/auth/check-email', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: '이메일을 입력해주세요.' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/check-username', async (req, res) => {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: '닉네임을 입력해주세요.' });
  try {
    const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    res.json({ available: rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const {
    email, password, username,
    birthday, birthDate,
    security_question, security_answer,
    securityQuestion, securityAnswer,
  } = req.body;

  const bday = birthday || birthDate || null;
  const sq = security_question || securityQuestion || null;
  const sa = security_answer || securityAnswer || null;

  if (!email || !password || !username) {
    return res.status(400).json({ error: '필수 항목을 입력해주세요.' });
  }
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ error: '비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.' });
  }
  if (username.length < 2 || username.length > 20) {
    return res.status(400).json({ error: '닉네임은 2~20자로 입력해주세요.' });
  }

  try {
    const [emailRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (emailRows.length) return res.status(409).json({ error: '이미 사용 중인 이메일입니다.' });

    const [nameRows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
    if (nameRows.length) return res.status(409).json({ error: '이미 사용 중인 닉네임입니다.' });

    const [result] = await db.query(
      'INSERT INTO users (email, password, username, birthday, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, username, bday, sq, sa]
    );
    res.json({ id: result.insertId, message: '회원가입 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 아이디 찾기
app.post('/api/auth/find-id', async (req, res) => {
  const { nickname, birthDate } = req.body;
  try {
    const [rows] = await db.query("SELECT email FROM users WHERE username = ? AND birthday = ?", [nickname, birthDate]);
    if (rows.length > 0) {
      res.json({ email: rows[0].email });
    } else {
      res.status(404).json({ error: '일치하는 정보가 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 비밀번호 찾기 (보안 질문 기반)
app.post('/api/auth/find-pw', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query("SELECT security_question FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      res.json({ security_question: rows[0].security_question, message: '보안 질문을 확인해주세요.' });
    } else {
      res.status(404).json({ error: '일치하는 계정 정보가 없습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 비밀번호 재설정 (보안 질문 답변 확인 후)
app.post('/api/auth/reset-pw', async (req, res) => {
  const { email, security_answer, new_password, securityAnswer, newPassword } = req.body;
  const answer = security_answer || securityAnswer;
  const password = new_password || newPassword;

  if (!password || password.length < 8) {
    return res.status(400).json({ error: '비밀번호는 8자 이상, 영문·숫자·특수문자를 포함해야 합니다.' });
  }

  try {
    const [rows] = await db.query('SELECT id FROM users WHERE email = ? AND security_answer = ?', [email, answer]);
    if (rows.length > 0) {
      await db.query('UPDATE users SET password = ? WHERE id = ?', [password, rows[0].id]);
      res.json({ message: '비밀번호가 재설정되었습니다.' });
    } else {
      res.status(401).json({ error: '보안 질문 답변이 일치하지 않습니다.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? AND password = ?", [email, password]);
    const user = rows[0];
    if (user) {
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
      const { password, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } else res.status(401).json({ message: '인증 실패' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. 게시판 (Board) ---
app.get('/api/posts', async (req, res) => {
  const { category, sort = 'latest', search = '' } = req.query;
  let sql = `SELECT p.*, u.username as author, u.profile_image as author_img, b.name as category,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN boards b ON p.board_id = b.id
            WHERE 1=1`;
  const params = [];

  if (category && category !== '전체') {
    sql += " AND b.name = ?";
    params.push(category);
  }
  if (search) {
    sql += " AND (p.title LIKE ? OR p.content LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sort === 'likes') sql += " ORDER BY p.likes_count DESC";
  else if (sort === 'views') sql += " ORDER BY p.views DESC";
  else if (sort === 'comments') sql += " ORDER BY comment_count DESC";
  else sql += " ORDER BY p.created_at DESC";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    await db.query("UPDATE posts SET views = views + 1 WHERE id = ?", [req.params.id]);
    const [rows] = await db.query(`SELECT p.*, u.username as author, u.profile_image as author_img, b.name as category
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN boards b ON p.board_id = b.id
            WHERE p.id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/posts/:id', upload.array('images', 5), async (req, res) => {
  const { title, content, category, mission_id, existing_images } = req.body;
  let imageUrls;
  
  if (req.files && req.files.length > 0) {
    imageUrls = JSON.stringify(req.files.map(f => f.filename));
  } else if (existing_images) {
    imageUrls = existing_images;
  }

  try {
    // category 이름을 board_id로 변환
    let board_id = null;
    if (category) {
      const [boards] = await db.query("SELECT id FROM boards WHERE name = ?", [category]);
      if (boards.length > 0) board_id = boards[0].id;
    }

    let sql = "UPDATE posts SET title = ?, content = ?, category = ?, board_id = ?, mission_id = ?";
    const params = [title, content, category, board_id, mission_id || null];
    
    if (imageUrls) {
      sql += ", images = ?";
      params.push(imageUrls);
    }
    
    sql += " WHERE id = ?";
    params.push(req.params.id);
    
    await db.query(sql, params);
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    // 좋아요, 댓글, 즐겨찾기 등 연관 데이터 처리 (간소화를 위해 삭제만 진행)
    await db.query("DELETE FROM post_likes WHERE post_id = ?", [req.params.id]);
    await db.query("DELETE FROM comments WHERE post_id = ?", [req.params.id]);
    await db.query("DELETE FROM favorites WHERE post_id = ?", [req.params.id]);
    await db.query("DELETE FROM posts WHERE id = ?", [req.params.id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts', upload.array('images', 5), async (req, res) => {
  const { user_id, title, content, category, lat, lng, mission_id } = req.body;
  const imageUrls = JSON.stringify((req.files || []).map(f => f.filename));
  try {
    // category 이름을 board_id로 변환
    let board_id = null;
    if (category) {
      const [boards] = await db.query("SELECT id FROM boards WHERE name = ?", [category]);
      if (boards.length > 0) board_id = boards[0].id;
    }

    const [result] = await db.query(`INSERT INTO posts (user_id, board_id, title, content, category, images, lat, lng, mission_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [user_id, board_id, title, content, category, imageUrls, lat || null, lng || null, mission_id || null]);
    await db.query("UPDATE users SET records = records + 1 WHERE id = ?", [user_id]);
    await addPoints(user_id, 10, 'post', '새 탐사 기록을 등록했습니다.', result.insertId);

    // 탐사 종수 자동 업데이트
    await db.query(`
      UPDATE users SET species = (
        SELECT COUNT(DISTINCT p.title) FROM posts p 
        WHERE p.user_id = ? AND p.title IS NOT NULL AND p.title != ''
      ) WHERE id = ?
    `, [user_id, user_id]);
    
    if (mission_id) {
      await db.query('UPDATE missions SET current_count = current_count + 1 WHERE id = ?', [mission_id]);
      
      // 미션 참여 보너스 20 포인트
      await addPoints(user_id, 20, 'mission_participate', `미션 기록 등록 보너스`, mission_id);
      
      // 미션 성공 여부 확인
      const [[mission]] = await db.query("SELECT * FROM missions WHERE id = ?", [mission_id]);
      // 딱 목표치에 도달했을 때 1회만 지급
      if (mission && mission.current_count === mission.target_count) {
        await db.query("INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)",
          [user_id, null, null, 'mission', `🎉 미션 성공! "${mission.title}" 미션이 목표치를 달성했습니다!`]);
          
        // 참여한 모든 유저에게 50포인트 지급
        const [participants] = await db.query("SELECT DISTINCT user_id FROM posts WHERE mission_id = ?", [mission_id]);
        for (const p of participants) {
          await addPoints(p.user_id, 50, 'mission_complete', `미션 "${mission.title}" 달성 보너스`, mission_id);
          // 다른 참여자에게도 알림 전송 (본인 제외)
          if (p.user_id !== user_id) {
            await db.query("INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)",
              [p.user_id, null, null, 'mission', `🎉 미션 성공! 참여하신 "${mission.title}" 미션이 목표치를 달성했습니다!`]);
          }
        }
      }
    }
    res.json({ id: result.insertId, message: '기록 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. 마이페이지 (MyPage) ---
app.get('/api/users/profile/:username', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, username, profile_image, records, species, joined_at
      FROM users WHERE username = ?
    `, [req.params.username]);
    if (rows.length === 0) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, email, username, birthday, security_question, joined_at,
        records, species, comments, likes, profile_image, points,
        (SELECT COUNT(*) FROM post_likes WHERE user_id = users.id) as sent_likes
      FROM users WHERE id = ?
    `, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', upload.single('profile_image'), async (req, res) => {
  const { username, birthday, password, security_question, security_answer } = req.body;
  const profile_image = req.file ? req.file.filename : null;
  
  try {
    let sql = "UPDATE users SET username = ?";
    const params = [username];
    
    if (profile_image) {
      sql += ", profile_image = ?";
      params.push(profile_image);
    }
    if (birthday) {
      sql += ", birthday = ?";
      params.push(birthday);
    }
    if (password) {
      sql += ", password = ?";
      params.push(password);
    }
    if (security_question) {
      sql += ", security_question = ?";
      params.push(security_question);
    }
    if (security_answer) {
      sql += ", security_answer = ?";
      params.push(security_answer);
    }
    
    sql += " WHERE id = ?";
    params.push(req.params.id);
    
    await db.query(sql, params);
    
    // 업데이트된 유저 정보 반환
    const [rows] = await db.query("SELECT id, email, username, birthday, security_question, joined_at, records, species, comments, likes, profile_image FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: '프로필 수정 완료', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    // 연관 데이터 삭제
    await db.query("DELETE FROM post_likes WHERE user_id = ?", [req.params.id]);
    await db.query("DELETE FROM favorites WHERE user_id = ?", [req.params.id]);
    await db.query("DELETE FROM notifications WHERE user_id = ?", [req.params.id]);
    await db.query("DELETE FROM comments WHERE user_id = ?", [req.params.id]);
    await db.query("UPDATE posts SET user_id = NULL WHERE user_id = ?", [req.params.id]);
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: '회원 탈퇴 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 내가 쓴 글 조회
app.get('/api/users/:id/posts', async (req, res) => {
  const { category, sort = 'latest', start_date, end_date } = req.query;
  let sql = `SELECT p.*, u.username as author, u.profile_image as author_img, b.name as category,
            (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN boards b ON p.board_id = b.id
            WHERE p.user_id = ?`;
  const params = [req.params.id];

  if (category && category !== '전체') {
    sql += " AND b.name = ?";
    params.push(category);
  }
  if (start_date) {
    sql += " AND p.created_at >= ?";
    params.push(start_date);
  }
  if (end_date) {
    sql += " AND p.created_at <= ?";
    params.push(end_date + ' 23:59:59');
  }

  if (sort === 'oldest') sql += " ORDER BY p.created_at ASC";
  else if (sort === 'name') sql += " ORDER BY p.title ASC";
  else if (sort === 'likes') sql += " ORDER BY p.likes_count DESC";
  else sql += " ORDER BY p.created_at DESC";

  try {
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 특정 유저(공개 프로필)의 글 조회
app.get('/api/users/username/:username/posts', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.username as author, u.profile_image as author_img, b.name as category,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN boards b ON p.board_id = b.id
      WHERE u.username = ?
      ORDER BY p.created_at DESC
    `, [req.params.username]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 내가 좋아요한 글 조회
app.get('/api/users/:id/liked-posts', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.*, u.username as author, b.name as category 
      FROM posts p 
      JOIN post_likes pl ON p.id = pl.post_id 
      JOIN users u ON p.user_id = u.id 
      LEFT JOIN boards b ON p.board_id = b.id
      WHERE pl.user_id = ? ORDER BY pl.user_id`, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 내가 쓴 댓글 조회
app.get('/api/users/:id/comments', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT c.*, p.title as post_title, p.id as post_id 
      FROM comments c 
      JOIN posts p ON c.post_id = p.id 
      WHERE c.user_id = ? ORDER BY c.created_at DESC`, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 이미지 업로드 전용 (프로필 이미지)
app.post('/api/upload/profile', upload.single('profile_image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });
  const imageUrl = req.file.filename;
  res.json({ image: imageUrl, url: `/uploads/${imageUrl}` });
});

// --- 5. 생물 지도 (Biology Map) ---
app.get('/api/map/posts', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, title, category, images, lat, lng FROM posts WHERE lat IS NOT NULL AND lng IS NOT NULL");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- API: 특정 미션에 연결된 게시글 조회 (아카이브) - 반드시 /:id/posts 패턴 유지 ---
app.get('/api/missions/:id/posts', async (req, res) => {
  const missionId = req.params.id;
  console.log(`📦 아카이브 게시글 조회: mission_id=${missionId}`);
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.title, p.content, p.images, p.lat, p.lng, p.likes_count, p.created_at,
        u.username as author, u.profile_image as author_img, b.name as category,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN boards b ON p.board_id = b.id
      WHERE p.mission_id = ?
      ORDER BY p.created_at DESC
    `, [missionId]);
    console.log(`📦 아카이브 조회 결과: ${rows.length}개 게시글 발견`);
    res.json(rows);
  } catch (err) {
    console.error('📦 아카이브 조회 에러:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- 6. 미션 (Mission) ---
app.get('/api/missions', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM posts p WHERE p.mission_id = m.id) as post_count,
        (SELECT COUNT(DISTINCT p.user_id) FROM posts p WHERE p.mission_id = m.id) as participant_count,
        CASE
          WHEN m.target_count > 0 THEN LEAST(100, ROUND(((SELECT COUNT(*) FROM posts p WHERE p.mission_id = m.id) / m.target_count) * 100))
          ELSE 0
        END as progress
      FROM missions m
      ORDER BY
        CASE WHEN m.target_count > 0 AND (SELECT COUNT(*) FROM posts p WHERE p.mission_id = m.id) >= m.target_count THEN 1 ELSE 0 END ASC,
        m.end_date IS NULL ASC,
        m.end_date ASC,
        m.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/missions/:id', async (req, res) => {
  const missionId = req.params.id;
  console.log(`🎯 미션 단일 조회: mission_id=${missionId}`);
  try {
    const [[mission]] = await db.query(`
      SELECT m.*,
        (SELECT COUNT(*) FROM posts p WHERE p.mission_id = m.id) as post_count,
        (SELECT COUNT(DISTINCT p.user_id) FROM posts p WHERE p.mission_id = m.id) as participant_count,
        CASE
          WHEN m.target_count > 0 THEN LEAST(100, ROUND(((SELECT COUNT(*) FROM posts p WHERE p.mission_id = m.id) / m.target_count) * 100))
          ELSE 0
        END as progress
      FROM missions m
      WHERE m.id = ?
    `, [missionId]);

    if (!mission) return res.status(404).json({ error: '미션을 찾을 수 없습니다.' });
    res.json(mission);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/missions', async (req, res) => {
  const {
    user_id,
    title,
    description,
    category,
    tags,
    reward,
    target_count,
    end_date
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: '미션 이름을 입력해주세요.' });
  }

  const normalizedTarget = Number.parseInt(target_count, 10);
  if (!Number.isFinite(normalizedTarget) || normalizedTarget < 1) {
    return res.status(400).json({ error: '목표 기록 수는 1 이상이어야 합니다.' });
  }

  const normalizedTags = Array.isArray(tags)
    ? tags.map(tag => String(tag).trim()).filter(Boolean).join(',')
    : String(tags || '').split(',').map(tag => tag.trim()).filter(Boolean).join(',');

  try {
    const [result] = await db.query(`
      INSERT INTO missions
        (title, description, category, tags, reward, target_count, current_count, created_by, end_date)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
    `, [
      title.trim(),
      description || '',
      category || null,
      normalizedTags || null,
      reward || null,
      normalizedTarget,
      user_id || null,
      end_date || null
    ]);

    const [[mission]] = await db.query('SELECT * FROM missions WHERE id = ?', [result.insertId]);
    res.status(201).json({ message: '미션이 생성되었습니다.', mission });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 미션 삭제
app.delete('/api/missions/:id', async (req, res) => {
  const missionId = req.params.id;
  const { user_id } = req.body;

  try {
    const [[mission]] = await db.query('SELECT * FROM missions WHERE id = ?', [missionId]);
    if (!mission) return res.status(404).json({ error: '미션을 찾을 수 없습니다.' });

    if (mission.created_by && Number(mission.created_by) !== Number(user_id)) {
      return res.status(403).json({ error: '미션 생성자만 삭제할 수 있습니다.' });
    }

    // 관련 게시글의 mission_id를 NULL로 설정
    await db.query('UPDATE posts SET mission_id = NULL WHERE mission_id = ?', [missionId]);
    // 관련 포인트 내역 정리
    await db.query('DELETE FROM point_history WHERE related_id = ? AND (action_type = ? OR action_type = ?)', [missionId, 'mission_participate', 'mission_complete']);
    // 미션 삭제
    await db.query('DELETE FROM missions WHERE id = ?', [missionId]);

    res.json({ message: '미션이 삭제되었습니다.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Point History API ---
app.get('/api/users/:id/points/history', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM point_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/points', async (req, res) => {
  try {
    const [[{ points }]] = await db.query("SELECT points FROM users WHERE id = ?", [req.params.id]);
    const [{ total_earned }] = await db.query(
      "SELECT COALESCE(SUM(points), 0) as total_earned FROM point_history WHERE user_id = ? AND points > 0",
      [req.params.id]
    );
    res.json({ points: points || 0, total_earned: total_earned || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 관찰자 즐겨찾기 API ---
app.post('/api/users/favorites/:targetId', async (req, res) => {
  const { user_id } = req.body;
  const target_id = req.params.targetId;
  if (!user_id || user_id == target_id) return res.status(400).json({ error: '잘못된 요청입니다.' });
  
  try {
    const [rows] = await db.query("SELECT * FROM observer_favorites WHERE user_id = ? AND target_user_id = ?", [user_id, target_id]);
    if (rows.length > 0) {
      await db.query("DELETE FROM observer_favorites WHERE user_id = ? AND target_user_id = ?", [user_id, target_id]);
      res.json({ favorited: false });
    } else {
      await db.query("INSERT INTO observer_favorites (user_id, target_user_id) VALUES (?, ?)", [user_id, target_id]);
      res.json({ favorited: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/users/:id/favorites', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT u.id, u.username, u.profile_image, u.records, u.species
      FROM observer_favorites f
      JOIN users u ON f.target_user_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 탐사 종수(고유 제목) API ---
app.get('/api/users/:id/species', async (req, res) => {
  try {
    // 고유 제목 기준 탐사 종수 (게시판 이름 포함)
    const [rows] = await db.query(`
      SELECT MIN(p.id) as post_id, p.title as species_name, b.name as category, MIN(p.created_at) as first_seen, COUNT(p.id) as count
      FROM posts p
      LEFT JOIN boards b ON p.board_id = b.id
      WHERE p.user_id = ? AND p.title IS NOT NULL AND p.title != ''
      GROUP BY p.title, b.name
      ORDER BY first_seen DESC
    `, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 7. 관찰자 (Observer/Ranking) ---
app.get('/api/observers', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, username, profile_image, records, species, likes,
      (records * 100 + species * 50 + likes * 10) as score
      FROM users 
      ORDER BY score DESC 
      LIMIT 100
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 8. 알림 센터 (Notification) ---
app.get('/api/notifications/:user_id', async (req, res) => {
  try {
    // 30일 지난 알림 자동 삭제
    await db.query("DELETE FROM notifications WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)", [req.params.user_id]);
    
    const [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/notifications/:user_id/read', async (req, res) => {
  try {
    await db.query("UPDATE notifications SET is_read = TRUE WHERE user_id = ?", [req.params.user_id]);
    res.json({ message: '모든 알림 읽음 처리' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    await db.query("DELETE FROM notifications WHERE id = ?", [req.params.id]);
    res.json({ message: '알림 삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 9. 즐겨찾기 (Favorites) ---
app.get('/api/favorites/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT p.* FROM posts p JOIN favorites f ON p.id = f.post_id WHERE f.user_id = ?`, [req.params.user_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/favorites', async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    await db.query("INSERT INTO favorites (user_id, post_id) VALUES (?, ?)", [user_id, post_id]);
    res.json({ message: '즐겨찾기 추가' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/favorites', async (req, res) => {
  const { user_id, post_id } = req.body;
  try {
    await db.query("DELETE FROM favorites WHERE user_id = ? AND post_id = ?", [user_id, post_id]);
    res.json({ message: '즐겨찾기 삭제' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 기타 (Comments, Likes) ---
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT c.*, u.username, u.profile_image FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC`, [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  const { post_id, user_id, content, parent_id } = req.body;
  try {
    const [result] = await db.query("INSERT INTO comments (post_id, user_id, content, parent_id) VALUES (?, ?, ?, ?)", [post_id, user_id, content, parent_id || null]);
    await db.query("UPDATE users SET comments = comments + 1 WHERE id = ?", [user_id]);

    // 알림 생성 로직
    const [[post]] = await db.query("SELECT user_id, title FROM posts WHERE id = ?", [post_id]);
    const [[sender]] = await db.query("SELECT username FROM users WHERE id = ?", [user_id]);

    if (parent_id) {
      // 대댓글 알림: 원댓글 작성자에게 알림
      const [[parentComment]] = await db.query("SELECT user_id FROM comments WHERE id = ?", [parent_id]);
      if (parentComment && parentComment.user_id !== user_id) {
        await db.query("INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)", 
          [parentComment.user_id, user_id, post_id, 'reply', `${sender.username}님이 회원님의 댓글에 답글을 남겼습니다: "${content.substring(0, 20)}..."`]);
      }
    } else {
      // 댓글 알림: 게시글 작성자에게 알림
      if (post && post.user_id !== user_id) {
        await db.query("INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)", 
          [post.user_id, user_id, post_id, 'comment', `${sender.username}님이 "${post.title}" 게시글에 댓글을 남겼습니다.`]);
      }
    }

    // 포인트 적립: 댓글 작성
    await addPoints(user_id, 3, 'comment', '댓글을 작성했습니다.', result.insertId);

    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    // parent_id인 경우 하위 댓글까지 함께 삭제됨 (FK ON DELETE CASCADE 설정됨)
    await db.query("DELETE FROM comments WHERE id = ?", [req.params.id]);
    res.json({ message: '댓글 삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/comments/:id', async (req, res) => {
  const { user_id, content } = req.body;
  try {
    const [rows] = await db.query('SELECT user_id FROM comments WHERE id = ?', [req.params.id]);
    if (!rows.length || rows[0].user_id !== parseInt(user_id, 10)) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }
    await db.query('UPDATE comments SET content = ? WHERE id = ?', [content, req.params.id]);
    res.json({ message: '수정 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/posts/:id/like', async (req, res) => {
  const { user_id } = req.body;
  const post_id = req.params.id;
  try {
    const [rows] = await db.query("SELECT * FROM post_likes WHERE user_id = ? AND post_id = ?", [user_id, post_id]);
    if (rows.length > 0) {
      await db.query("DELETE FROM post_likes WHERE user_id = ? AND post_id = ?", [user_id, post_id]);
      await db.query("UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?", [post_id]);
      res.json({ liked: false });
    } else {
      await db.query("INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)", [user_id, post_id]);
      await db.query("UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?", [post_id]);
      
      // 알림 생성 로직
      const [[post]] = await db.query("SELECT user_id, title FROM posts WHERE id = ?", [post_id]);
      const [[sender]] = await db.query("SELECT username FROM users WHERE id = ?", [user_id]);
      
      if (post && post.user_id !== user_id) {
        await db.query("INSERT INTO notifications (user_id, sender_id, post_id, type, content) VALUES (?, ?, ?, ?, ?)", 
          [post.user_id, user_id, post_id, 'like', `${sender.username}님이 "${post.title}" 게시물을 좋아합니다.`]);
        // 포인트 적립: 게시글 작성자가 좋아요를 받으면 포인트 지급
        await addPoints(post.user_id, 2, 'like_received', `"${post.title}" 게시글이 좋아요를 받았습니다.`, post_id);
      }
      
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA fallback: API/정적파일이 아닌 모든 요청은 index.html 반환
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  // 정적 파일이 존재하는지 확인
  const staticPath = path.join(__dirname, '..', 'wildlog-frontend', 'dist', req.path === '/' ? 'index.html' : req.path);
  if (fs.existsSync(staticPath) && !fs.statSync(staticPath).isDirectory()) {
    return next(); // 정적 파일이 있으면 다음 미들웨어로
  }
  res.sendFile(path.join(__dirname, '..', 'wildlog-frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: ${PORT}`));
}

startServer();

