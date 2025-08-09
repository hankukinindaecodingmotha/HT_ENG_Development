const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let eocrProducts = [];
let users = [
    // 기본 관리자 계정 (비밀번호: admin1234)
    // 실제 운영에서는 .env 기반으로 초기화하거나 DB 사용 권장
    {
        id: 'admin',
        username: 'admin',
        passwordHash: bcrypt.hashSync('admin1234', 10),
        role: 'admin'
    }
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// EOCR 데이터 로드 함수 (key 공백 제거)
function loadEOCRData() {
    const csvPath = path.join(__dirname, '../Resource/EOCR설정표.csv');
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            // 모든 key의 앞뒤 공백을 제거한 새 객체 생성
            const trimmedRow = {};
            Object.keys(row).forEach(key => {
                const trimmedKey = key.trim();
                trimmedRow[trimmedKey] = row[key];
            });

            // '제품' 필드가 비어있지 않은 경우만 추가
            if (trimmedRow.제품 && trimmedRow.제품.trim() !== '') {
                eocrProducts.push(trimmedRow);
            }
        })
        .on('end', () => {
            console.log('EOCR 데이터 로드 완료! 총 개수:', eocrProducts.length);
        });
}

loadEOCRData();

// Swagger 설정
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'EOCR API 문서',
        version: '1.0.0',
        description: 'EOCR 제품 정보를 위한 API 문서입니다.',
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: '로컬 서버',
        },
    ],
};

const options = {
    swaggerDefinition,
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 인증 관련 미들웨어
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: '토큰이 없습니다.' });
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: '토큰이 유효하지 않습니다.' });
        req.user = user;
        next();
    });
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: '관리자 권한이 필요합니다.' });
    }
    next();
}

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 사용자 로그인
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: 로그인 성공(JWT 토큰 반환)
 *       401:
 *         description: 인증 실패
 */
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ message: '잘못된 사용자 정보입니다.' });
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: '잘못된 사용자 정보입니다.' });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, username: user.username, role: user.role });
});

/**
 * @swagger
 * /api/admin/summary:
 *   get:
 *     summary: 관리자 대시보드 요약 정보
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 요약 정보
 *       401:
 *         description: 토큰 누락
 *       403:
 *         description: 권한 부족
 */
app.get('/api/admin/summary', authenticateToken, requireAdmin, (req, res) => {
    res.json({
        totalProducts: eocrProducts.length,
        serverTime: new Date().toISOString(),
        admin: req.user.username
    });
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 모든 EOCR 제품 목록 조회
 *     responses:
 *       200:
 *         description: 제품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get('/api/products', (req, res) => {
    res.json(eocrProducts);
});

/**
 * @swagger
 * /api/products/filter:
 *   get:
 *     summary: EOCR 제품 필터 검색
 *     description: 다양한 조건으로 EOCR 제품을 필터링합니다.
 *     parameters:
 *       - in: query
 *         name: 제품명
 *         schema:
 *           type: string
 *         description: 제품명
 *       - in: query
 *         name: 상세설명
 *         schema:
 *           type: string
 *         description: 제품 상세 설명
 *       - in: query
 *         name: AC_DC
 *         schema:
 *           type: string
 *           enum: [AC, DC, 모든 조건]
 *         description: AC / DC
 *       - in: query
 *         name: 제품군
 *         schema:
 *           type: string
 *           enum: [Analog, Digital, Accessory, 모든 조건]
 *         description: 제품군
 *       - in: query
 *         name: 보호종류
 *         schema:
 *           type: string
 *           enum: [전류, 전압, 모든 조건]
 *         description: 보호종류
 *       - in: query
 *         name: 통신여부
 *         schema:
 *           type: string
 *           enum: [비통신, 통신, 모든 조건]
 *         description: 통신여부
 *       - in: query
 *         name: 통신종류
 *         schema:
 *           type: string
 *           enum: [4-20mA, 불가, Modbus-RTU(RS485), Modbus-RTU(RS485)/4-20mA, Modbus-RTU(RS485)/TCP(Eternet)/4-20mA, 모든 조건]
 *         description: 통신종류
 *       - in: query
 *         name: 누설_지락
 *         schema:
 *           type: string
 *           enum: [가능, 불가능, 모든 조건]
 *         description: 누설(지락)
 *       - in: query
 *         name: 단락
 *         schema:
 *           type: string
 *           enum: [가능, 불가능, 모든 조건]
 *         description: 단락
 *       - in: query
 *         name: 과전류_저전류
 *         schema:
 *           type: string
 *           enum: [가능, 불가능, 모든 조건, 과전류, 저전류]
 *         description: 과전류 / 저전류
 *       - in: query
 *         name: 결상
 *         schema:
 *           type: string
 *           enum: [가능, 불가능, 모든 조건, X]
 *         description: 결상
 *       - in: query
 *         name: 역상
 *         schema:
 *           type: string
 *           enum: [가능, 불가능, 모든 조건, X]
 *         description: 역상
 *       - in: query
 *         name: 과전압_저전압
 *         schema:
 *           type: string
 *           enum: [과전압, 저전압, 가능, 불가능, 모든 조건]
 *         description: 과전압 / 저전압
 *       - in: query
 *         name: 전력
 *         schema:
 *           type: string
 *           enum: [가능, 불가, 모든 조건]
 *         description: 전력
 *       - in: query
 *         name: 내장_ZCT
 *         schema:
 *           type: string
 *           enum: [O, 모든 조건]
 *         description: 내장 ZCT
 *     responses:
 *       200:
 *         description: 필터링된 EOCR 제품 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   제품명:
 *                     type: string
 *                   상세설명:
 *                     type: string
 *                   AC_DC:
 *                     type: string
 *                   제품군:
 *                     type: string
 *                   보호종류:
 *                     type: string
 *                   통신여부:
 *                     type: string
 *                   통신종류:
 *                     type: string
 *                   누설_지락:
 *                     type: string
 *                   단락:
 *                     type: string
 *                   과전류_저전류:
 *                     type: string
 *                   결상:
 *                     type: string
 *                   역상:
 *                     type: string
 *                   과전압_저전압:
 *                     type: string
 *                   전력:
 *                     type: string
 *                   내장_ZCT:
 *                     type: string
 */
app.get('/api/products/filter', (req, res) => {
    let filtered = [...eocrProducts];

    // 쿼리 파라미터로 필터링
    const {
        제품명,
        상세설명,
        AC_DC,
        제품군,
        보호종류,
        통신여부,
        통신종류,
        누설_지락,
        단락,
        과전류_저전류,
        결상,
        역상,
        과전압_저전압,
        전력,
        내장_ZCT
    } = req.query;

    if (제품명) filtered = filtered.filter(p => p.제품 && p.제품.includes(제품명));
    if (상세설명) filtered = filtered.filter(p => p.상세설명 && p.상세설명.includes(상세설명));
    if (AC_DC && AC_DC !== '모든 조건') filtered = filtered.filter(p => p['AC or DC'] === AC_DC);
    if (제품군 && 제품군 !== '모든 조건') filtered = filtered.filter(p => p.제품군 === 제품군);
    if (보호종류 && 보호종류 !== '모든 조건') filtered = filtered.filter(p => p.보호종류 === 보호종류);
    if (통신여부 && 통신여부 !== '모든 조건') filtered = filtered.filter(p => p.통신여부 === 통신여부);
    if (통신종류 && 통신종류 !== '모든 조건') filtered = filtered.filter(p => p.통신종류 === 통신종류);
    if (누설_지락 && 누설_지락 !== '모든 조건') filtered = filtered.filter(p => p['누설(지락)'] === 누설_지락);
    if (단락 && 단락 !== '모든 조건') filtered = filtered.filter(p => p.단락 === 단락);
    if (과전류_저전류 && 과전류_저전류 !== '모든 조건') filtered = filtered.filter(p => p['과전류/저전류'] === 과전류_저전류);
    if (결상 && 결상 !== '모든 조건') filtered = filtered.filter(p => p.결상 === 결상);
    if (역상 && 역상 !== '모든 조건') filtered = filtered.filter(p => p.역상 === 역상);
    if (과전압_저전압 && 과전압_저전압 !== '모든 조건') filtered = filtered.filter(p => p['과전압/저전압'] === 과전압_저전압);
    if (전력 && 전력 !== '모든 조건') filtered = filtered.filter(p => p.전력 === 전력);
    if (내장_ZCT && 내장_ZCT !== '모든 조건') filtered = filtered.filter(p => p['내장 ZCT'] === 내장_ZCT);

    res.json(filtered);
});

/**
 * @swagger
 * /api/products/suggest:
 *   get:
 *     summary: 연관 검색어(제품명) 자동완성
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: 검색어 일부
 *     responses:
 *       200:
 *         description: 연관 검색어 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
app.get('/api/products/suggest', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json([]);
    // 제품명 중에서 입력값이 포함된 것만, 중복 없이 최대 10개 추천
    const suggestions = Array.from(
        new Set(
            eocrProducts
                .map(p => p.제품)
                .filter(name => name && name.toLowerCase().includes(q.toLowerCase()))
        )
    ).slice(0, 10);
    res.json(suggestions);
});

app.listen(PORT, () => {
    console.log(`서버가 실행 중입니다! http://localhost:${PORT}`);
    console.log(`Swagger 문서: http://localhost:${PORT}/api-docs`);
});