const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    records INT DEFAULT 0,
    species INT DEFAULT 0,
    comments INT DEFAULT 0,
    likes INT DEFAULT 0,
    profile_image TEXT
  )`);

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
  )`);

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
    target_count INT DEFAULT 100,
    current_count INT DEFAULT 0,
    image TEXT,
    end_date DATETIME
  )`);

  // 6. 알림 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    type VARCHAR(50), -- 'like', 'comment', 'mission'
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);

  // 7. 즐겨찾기 테이블
  await db.query(`CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    post_id INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id),
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(post_id) REFERENCES posts(id)
  )`);

  // 초기 미션 데이터 (없을 경우)
  const [rows] = await db.query("SELECT COUNT(*) as count FROM missions");
  if (rows[0].count === 0) {
    await db.query("INSERT INTO missions (title, description, target_count, current_count) VALUES (?, ?, ?, ?)", 
      ['지리산 반달곰 흔적 찾기', '지리산 일대의 반달가슴곰 서식 흔적을 기록해주세요.', 100, 65]);
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
    const [recentPosts] = await db.query(`SELECT p.*, u.username as author FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC LIMIT 6`);
    const [hotMissions] = await db.query(`SELECT * FROM missions ORDER BY current_count/target_count DESC LIMIT 1`);
    const [topObservers] = await db.query(`SELECT id, username, records as score, profile_image FROM users ORDER BY records DESC LIMIT 3`);
    res.json({ recentPosts, hotMission: hotMissions[0], topObservers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. 로그인 및 회원가입 (Login/Auth) ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const [result] = await db.query("INSERT INTO users (email, password, username) VALUES (?, ?, ?)", [email, password, username]);
    res.json({ id: result.insertId, message: '회원가입 완료' });
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
  const imageUrls = JSON.stringify(req.files.map(f => f.filename));
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
    res.json({ id: result.insertId, message: '기록 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. 마이페이지 (MyPage) ---
app.get('/api/users/:id', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, email, username, joined_at, records, species, comments, likes, profile_image FROM users WHERE id = ?", [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/users/:id', upload.single('profile_image'), async (req, res) => {
  const { username } = req.body;
  const profile_image = req.file ? req.file.filename : null;
  
  try {
    let sql = "UPDATE users SET username = ?";
    const params = [username];
    
    if (profile_image) {
      sql += ", profile_image = ?";
      params.push(profile_image);
    }
    
    sql += " WHERE id = ?";
    params.push(req.params.id);
    
    await db.query(sql, params);
    
    // 업데이트된 유저 정보 반환
    const [rows] = await db.query("SELECT id, email, username, joined_at, records, species, comments, likes, profile_image FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: '프로필 수정 완료', user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// --- 6. 미션 (Mission) ---
app.get('/api/missions', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM missions ORDER BY end_date ASC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 7. 관찰자 (Observer/Ranking) ---
app.get('/api/observers', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, username, profile_image, records, species, likes FROM users ORDER BY records DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 8. 알림 센터 (Notification) ---
app.get('/api/notifications/:user_id', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [req.params.user_id]);
    res.json(rows);
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
      res.json({ liked: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 서버 실행 중: ${PORT}`));
}

startServer();

