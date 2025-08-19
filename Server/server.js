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

// 환경변수 설정 (프로덕션/개발 환경 구분)
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;

// CORS 설정 (프로덕션에서는 특정 도메인만 허용)
const corsOptions = {
    origin: NODE_ENV === 'production'
        ? ['http://hteng.co.kr', 'https://hteng.co.kr']
        : true,
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// 정적 파일 제공 (프로덕션에서는 절대 경로 사용)
if (NODE_ENV === 'production') {
    app.use('/assets', express.static(path.join(__dirname, '../Web_UI/Assesets')));
    app.use('/images', express.static(path.join(__dirname, '../Web_UI/Assesets/Image')));
} else {
    app.use('/assets', express.static(path.join(__dirname, '../Web_UI/Assesets')));
    app.use('/images', express.static(path.join(__dirname, '../Web_UI/Assesets/Image')));
}

let eocrProducts = [];
let users = [
    // 기본 관리자 계정 (비밀번호: admin1234)
    {
        id: 'admin',
        username: 'admin',
        displayName: '관리자',
        passwordHash: bcrypt.hashSync('admin1234', 10),
        role: 'admin',
        status: 'active',
        email: 'admin@hteng.com',
        joinDate: '2024-01-01'
    },
    // 활성 사용자들 (비밀번호: user1234)
    {
        id: 'user1',
        username: 'user1',
        displayName: '김영희',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'active',
        email: 'user1@hteng.com',
        joinDate: '2024-01-15'
    },
    {
        id: 'user2',
        username: 'user2',
        displayName: '박민수',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'active',
        email: 'user2@hteng.com',
        joinDate: '2024-01-20'
    },
    {
        id: 'user3',
        username: 'user3',
        displayName: '이지영',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'active',
        email: 'user3@hteng.com',
        joinDate: '2024-01-25'
    },
    // 승인 대기 사용자들
    {
        id: 'user4',
        username: 'user4',
        displayName: '최준호',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'pending',
        email: 'user4@hteng.com',
        joinDate: '2024-02-01'
    },
    {
        id: 'user5',
        username: 'user5',
        displayName: '정수진',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'pending',
        email: 'user5@hteng.com',
        joinDate: '2024-02-05'
    },
    {
        id: 'user6',
        username: 'user6',
        displayName: '한동훈',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'pending',
        email: 'user6@hteng.com',
        joinDate: '2024-02-10'
    },
    // 비활성 사용자들
    {
        id: 'user7',
        username: 'user7',
        displayName: '송미라',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'inactive',
        email: 'user7@hteng.com',
        joinDate: '2024-01-30'
    },
    {
        id: 'user8',
        username: 'user8',
        displayName: '강태우',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'inactive',
        email: 'user8@hteng.com',
        joinDate: '2024-02-03'
    },
    {
        id: 'user9',
        username: 'user9',
        displayName: '윤서연',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'inactive',
        email: 'user9@hteng.com',
        joinDate: '2024-02-08'
    },
    {
        id: 'user10',
        username: 'user10',
        displayName: '임재현',
        passwordHash: bcrypt.hashSync('user1234', 10),
        role: 'user',
        status: 'inactive',
        email: 'user10@hteng.com',
        joinDate: '2024-02-12'
    }
];

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';

// EOCR 데이터 로드
function loadEOCRData() {
    const csvPath = path.join(__dirname, '../Resource/EOCR설정표.csv');
    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
            const trimmedRow = {};
            Object.keys(row).forEach(key => {
                const trimmedKey = key.trim();
                trimmedRow[trimmedKey] = row[key];
            });
            if (trimmedRow.제품 && trimmedRow.제품.trim() !== '') {
                eocrProducts.push(trimmedRow);
            }
        })
        .on('end', () => {
            console.log('EOCR 데이터 로드 완료! 총 개수:', eocrProducts.length);
        });
}
loadEOCRData();

// 서버 시작 시 초기 데이터 설정
global.companyInfo = {
    title: '회사 소개',
    subtitle: 'HTeng이 추구하는 핵심 가치입니다',
    name: 'HTENG',
    description: 'HTENG는 전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다. 고객과의 신뢰를 바탕으로 지속적인 성장과 혁신을 추구합니다.',
    phone: '031-123-4567',
    email: 'info@hteng.com',
    fax: '031-123-4568',
    website: 'https://www.hteng.com',
    hours: '월-금 09:00-18:00',
    history: [
        { year: '2025', event: '웹 리뉴얼 및 온라인 기술 지원 시작' },
        { year: '2020', event: '이튼·르그랑 공식 파트너 체결' },
        { year: '2010', event: 'HTENG 설립' }
    ],
    business: '산업 자동화 제품 유통, 전기 부품 판매, 현장 기술 컨설팅 및 유지보수',
    location: '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호',
    mapLat: 37.637966,  // 김포시 마스터비즈파크 정확한 위도
    mapLng: 126.680780, // 김포시 마스터비즈파크 정확한 경도
    mapZoom: 18,        // 지도 줌 레벨 (건물 단위 상세 표시)
    businessItems: [
        { title: '산업 자동화 제품 유통', description: '다양한 산업 자동화 제품을 공급합니다.' },
        { title: '전기 부품 판매', description: '고품질 전기 부품을 합리적인 가격에 제공합니다.' },
        { title: '현장 기술 컨설팅 및 유지보수', description: '전문 기술진이 현장에서 직접 지원합니다.' }
    ]
};

global.ceoInfo = {
    name: '홍길동',
    position: '대표이사',
    introduction: '안녕하세요. HT ENG 대표이사 홍길동입니다. 저희 HT ENG는 끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장해왔습니다. 앞으로도 여러분의 기대에 부응하며 지속 가능한 기업으로 나아가겠습니다. 감사합니다.',
    vision: '끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장',
    image: 'CEO.jpeg'
};

global.membersInfo = {
    title: '직원 소개',
    subtitle: '전문성과 열정으로 고객의 성공을 만들어갑니다',
    members: [
        {
            name: '민과장',
            position: '과장',
            department: '기술팀',
            description: '경력 3년의 전문성을 바탕으로 고객에게 최적의 솔루션을 제공합니다.',
            image: 'CEO.jpeg',
            experience: '3년',
            email: 'chulsoo@hteng.com'
        },
        {
            name: '정태주',
            position: '기술팀',
            department: '기술팀',
            description: '신입으로서 열정과 창의성을 바탕으로 새로운 아이디어를 제안합니다.',
            image: 'CEO.jpeg',
            experience: '1년',
            email: 'younghee@hteng.com'
        }
    ]
};

global.valuesInfo = {
    title: '우리의 가치',
    subtitle: 'HTeng이 추구하는 핵심 가치입니다',
    values: [
        {
            title: '혁신',
            description: '끊임없는 연구개발을 통해 최고의 기술을 제공합니다.',
            icon: 'fas fa-lightbulb'
        },
        {
            title: '신뢰',
            description: '고객과의 약속을 지키고 안전한 제품을 제공합니다.',
            icon: 'fas fa-handshake'
        },
        {
            title: '성장',
            description: '직원과 회사의 지속적인 성장을 추구합니다.',
            icon: 'fas fa-chart-line'
        }
    ]
};

// 메인페이지 데이터
global.mainPageData = {
    // 배너 이미지 관리
    banner: {
        image: '../Assesets/Image/회사 배너.png',
        alt: 'HTeng 사진'
    },

    // 브랜드 관리
    brands: [
        {
            name: '슈나이더',
            image: '../Assesets/Image/슈나이더.png',
            url: 'https://www.se.com/kr/ko/',
            alt: '슈나이더'
        },
        {
            name: '피자토',
            image: '../Assesets/Image/피자토.png',
            url: 'https://www.pizzato.com',
            alt: '피자토'
        },
        {
            name: '이튼',
            image: '../Assesets/Image/이튼.png',
            url: 'https://www.eaton.com/kr/ko-kr.html',
            alt: '이튼'
        },
        {
            name: '르그랑',
            image: '../Assesets/Image/르그랑.png',
            url: 'https://www.legrand.co.kr/ko',
            alt: '르그랑'
        }
    ],

    // Contact 섹션 관리
    contact: {
        ceo: {
            name: '정탁영',
            position: 'CEO',
            phone: '010-1234-1234',
            email: 'contact@hteng.com',
            address: '서울특별시 강남구 어딘가로 123',
            experience: [
                '슈나이더 일렉트릭: 2000-2010',
                'HT_ENG: ~ 2025'
            ],
            image: '../Assesets/Image/CEO.jpeg'
        },
        manager: {
            name: '민과장님',
            position: 'Manager',
            phone: '010-1234-1234',
            email: 'contact@hteng.com',
            address: '서울특별시 강남구 어딘가로 123',
            experience: [
                'HT_ENG: ~2025'
            ],
            image: '../Assesets/Image/CEO.jpeg'
        }
    },

    // 설명 섹션 관리
    descriptions: [
        {
            title: '판매',
            image: '../Assesets/Image/sale.jpg',
            alt: '판매 이미지',
            content: 'HTENG는 다양한 전기 부품을 합리적인 가격으로 제공합니다. 슈나이더, 이튼, 르그랑 등의 브랜드를 취급합니다.'
        },
        {
            title: '기술 지원',
            image: '../Assesets/Image/support.jpg',
            alt: '기술 지원 이미지',
            content: '고객의 안정적인 시스템 운영을 위해 전문적인 기술 지원을 제공합니다. 설치부터 유지보수까지 책임집니다.'
        }
    ]
};

// Swagger
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'EOCR API 문서',
        version: '1.0.0',
        description: 'EOCR 제품 정보를 위한 API 문서입니다.',
    },
    servers: [{ url: 'http://localhost:3000', description: '로컬 서버' }],
};
const options = { swaggerDefinition, apis: ['./server.js'] };
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 인증 미들웨어
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
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: 사용자명
 *               password:
 *                 type: string
 *                 description: 비밀번호
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT 토큰
 *                 username:
 *                   type: string
 *                   description: 사용자명
 *                 role:
 *                   type: string
 *                   description: 사용자 역할
 *       401:
 *         description: 로그인 실패
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 사용자 찾기
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(401).json({ message: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 비밀번호 확인
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ message: '사용자명 또는 비밀번호가 올바르지 않습니다.' });
        }

        // 사용자 상태 확인
        if (user.status === 'inactive') {
            return res.status(401).json({ message: '비활성화된 계정입니다. 관리자에게 문의하세요.' });
        }

        if (user.status === 'pending') {
            return res.status(401).json({ message: '승인 대기 중인 계정입니다. 관리자 승인을 기다려주세요.' });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role,
                status: user.status
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            username: user.username,
            role: user.role,
            displayName: user.displayName,
            status: user.status
        });
    } catch (error) {
        console.error('로그인 실패:', error);
        res.status(500).json({ message: '로그인 처리 중 오류가 발생했습니다.' });
    }
});

// 사용자 목록 조회
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
    try {
        console.log('=== 사용자 목록 조회 요청 받음 ===');
        console.log('요청 사용자 ID:', req.user.id);
        console.log('요청 사용자 역할:', req.user.role);
        console.log('전체 사용자 배열:', users);
        console.log('사용자 수:', users.length);

        if (users.length === 0) {
            console.log('⚠️ 사용자 배열이 비어있습니다!');
        } else {
            console.log('첫 번째 사용자 예시:', users[0]);
        }

        const userList = users.map(user => ({
            id: user.id,
            username: user.username,
            displayName: user.displayName,
            role: user.role,
            status: user.status,
            email: user.email || '',
            joinDate: user.joinDate || new Date().toISOString().split('T')[0]
        }));

        console.log('변환된 사용자 목록:', userList);
        console.log('응답할 사용자 수:', userList.length);

        res.json(userList);
    } catch (error) {
        console.error('사용자 목록 조회 실패:', error);
        res.status(500).json({ message: '사용자 목록 조회에 실패했습니다.' });
    }
});

// 새 사용자 추가
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { username, displayName, password, role, email } = req.body;

        // 필수 필드 검증
        if (!username || !displayName || !password || !role) {
            return res.status(400).json({ message: '모든 필수 항목을 입력해주세요.' });
        }

        // 사용자명 중복 확인
        if (users.find(u => u.username === username)) {
            return res.status(400).json({ message: '이미 존재하는 사용자명입니다.' });
        }

        // 비밀번호 해시화
        const passwordHash = await bcrypt.hash(password, 10);

        // 새 사용자 생성
        const newUser = {
            id: uuidv4(),
            username,
            displayName,
            passwordHash,
            role,
            email,
            status: 'active',
            joinDate: new Date().toISOString().split('T')[0]
        };

        users.push(newUser);

        res.status(201).json({
            message: '사용자가 성공적으로 추가되었습니다.',
            user: {
                id: newUser.id,
                username: newUser.username,
                displayName: newUser.displayName,
                role: newUser.role,
                status: newUser.status,
                email: newUser.email,
                joinDate: newUser.joinDate
            }
        });
    } catch (error) {
        console.error('사용자 추가 실패:', error);
        res.status(500).json({ message: '사용자 추가에 실패했습니다.' });
    }
});

// 사용자 정보 수정
app.put('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { displayName, role, status, email, password } = req.body;

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[userIndex];

        // 관리자 계정 수정 제한
        if (user.role === 'admin' && req.user.id !== userId) {
            return res.status(403).json({ message: '다른 관리자 계정은 수정할 수 없습니다.' });
        }

        // 사용자 정보 업데이트
        if (displayName) user.displayName = displayName;
        if (role) user.role = role;
        if (status) user.status = status;
        if (email) user.email = email;

        // 비밀번호 변경 시
        if (password) {
            user.passwordHash = await bcrypt.hash(password, 10);
        }

        res.json({
            message: '사용자 정보가 성공적으로 수정되었습니다.',
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                status: user.status,
                email: user.email,
                joinDate: user.joinDate
            }
        });
    } catch (error) {
        console.error('사용자 수정 실패:', error);
        res.status(500).json({ message: '사용자 수정에 실패했습니다.' });
    }
});

// 사용자 상태 변경 (승인/거절/활성화/비활성화)
app.patch('/api/admin/users/:userId/status', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[userIndex];

        // 상태 변경 검증
        if (!['active', 'inactive', 'pending'].includes(status)) {
            return res.status(400).json({ message: '유효하지 않은 상태입니다.' });
        }

        // 관리자 계정 비활성화 방지
        if (user.role === 'admin' && status === 'inactive') {
            return res.status(403).json({ message: '관리자 계정은 비활성화할 수 없습니다.' });
        }

        // 상태 업데이트
        user.status = status;

        res.json({
            message: '사용자 상태가 성공적으로 변경되었습니다.',
            user: {
                id: user.id,
                username: user.username,
                displayName: user.displayName,
                role: user.role,
                status: user.status,
                email: user.email,
                joinDate: user.joinDate
            }
        });
    } catch (error) {
        console.error('사용자 상태 변경 실패:', error);
        res.status(500).json({ message: '사용자 상태 변경에 실패했습니다.' });
    }
});

// 사용자 삭제
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { userId } = req.params;

        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        const user = users[userIndex];

        // 관리자 계정 삭제 방지
        if (user.role === 'admin') {
            return res.status(403).json({ message: '관리자 계정은 삭제할 수 없습니다.' });
        }

        // 현재 로그인한 사용자 삭제 방지
        if (user.id === req.user.id) {
            return res.status(403).json({ message: '현재 로그인한 사용자는 삭제할 수 없습니다.' });
        }

        // 사용자 제거
        users.splice(userIndex, 1);

        res.json({ message: '사용자가 성공적으로 삭제되었습니다.' });
    } catch (error) {
        console.error('사용자 삭제 실패:', error);
        res.status(500).json({ message: '사용자 삭제에 실패했습니다.' });
    }
});

// 관리자 대시보드 통계
app.get('/api/admin/summary', authenticateToken, requireAdmin, (req, res) => {
    try {
        const totalUsers = users.length;
        const activeUsers = users.filter(u => u.status === 'active').length;
        const pendingUsers = users.filter(u => u.status === 'pending').length;
        const totalProducts = eocrProducts.length;

        res.json({
            totalUsers,
            activeUsers,
            pendingUsers,
            totalProducts
        });
    } catch (error) {
        console.error('관리자 통계 조회 실패:', error);
        res.status(500).json({ message: '통계 조회에 실패했습니다.' });
    }
});

// 회사 정보 업데이트
app.put('/api/admin/company', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { name, description, history, business, location } = req.body;

        // 실제로는 데이터베이스에 저장
        // 여기서는 메모리에 임시 저장
        global.companyInfo = {
            name: name || 'HTENG',
            description: description || '전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다.',
            history: history || [],
            business: business || '산업 자동화 제품 유통, 전기 부품 판매, 현장 기술 컨설팅 및 유지보수',
            location: location || '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호'
        };

        res.json({
            message: '회사 정보가 성공적으로 업데이트되었습니다.',
            company: global.companyInfo
        });
    } catch (error) {
        console.error('회사 정보 업데이트 실패:', error);
        res.status(500).json({ message: '회사 정보 업데이트에 실패했습니다.' });
    }
});

// 회사 정보 조회
app.get('/api/admin/company', authenticateToken, requireAdmin, (req, res) => {
    try {
        const companyInfo = global.companyInfo || {
            name: 'HTENG',
            description: 'HTENG는 전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다. 고객과의 신뢰를 바탕으로 지속적인 성장과 혁신을 추구합니다.',
            history: [
                { year: '2025', event: '웹 리뉴얼 및 온라인 기술 지원 시작' },
                { year: '2020', event: '이튼·르그랑 공식 파트너 체결' },
                { year: '2010', event: 'HTENG 설립' }
            ],
            business: '산업 자동화 제품 유통, 전기 부품 판매, 현장 기술 컨설팅 및 유지보수',
            location: '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호'
        };

        res.json(companyInfo);
    } catch (error) {
        console.error('회사 정보 조회 실패:', error);
        res.status(500).json({ message: '회사 정보 조회에 실패했습니다.' });
    }
});

// CEO 소개 정보 조회
app.get('/api/admin/ceo', authenticateToken, requireAdmin, (req, res) => {
    try {
        const ceoInfo = global.ceoInfo || {
            name: '김철수',
            position: 'CEO',
            introduction: '전기 보호 장치 분야에서 20년간의 경험을 바탕으로 HTeng의 성장을 이끌고 있습니다.',
            vision: '안전하고 신뢰할 수 있는 전기 보호 솔루션을 통해 더 나은 세상을 만들어가겠습니다.',
            image: 'CEO.jpeg'
        };

        res.json(ceoInfo);
    } catch (error) {
        console.error('CEO 정보 조회 실패:', error);
        res.status(500).json({ message: 'CEO 정보 조회에 실패했습니다.' });
    }
});

// CEO 소개 정보 업데이트
app.put('/api/admin/ceo', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { name, position, introduction, vision, image } = req.body;

        // 실제로는 데이터베이스에 저장
        // 여기서는 메모리에 임시 저장
        global.ceoInfo = { name, position, introduction, vision, image };

        res.json({
            message: 'CEO 소개 정보가 성공적으로 업데이트되었습니다.',
            ceo: { name, position, introduction, vision, image }
        });
    } catch (error) {
        console.error('CEO 정보 업데이트 실패:', error);
        res.status(500).json({ message: 'CEO 정보 업데이트에 실패했습니다.' });
    }
});

// 회사 구성원 정보 조회
app.get('/api/admin/members', authenticateToken, requireAdmin, (req, res) => {
    try {
        const membersInfo = global.membersInfo || {
            title: '우리 팀을 소개합니다',
            subtitle: '전문성과 열정으로 고객의 성공을 만들어갑니다',
            members: [
                {
                    name: '김영희',
                    position: 'CTO',
                    department: '기술개발팀',
                    description: '전기 보호 장치 기술 개발을 담당하며, 혁신적인 솔루션을 연구합니다.',
                    image: 'member1.jpg'
                },
                {
                    name: '박민수',
                    position: '영업이사',
                    department: '영업팀',
                    description: '고객과의 신뢰 관계를 바탕으로 최적의 솔루션을 제안합니다.',
                    image: 'member2.jpg'
                }
            ]
        };

        res.json(membersInfo);
    } catch (error) {
        console.error('구성원 정보 조회 실패:', error);
        res.status(500).json({ message: '구성원 정보 조회에 실패했습니다.' });
    }
});

// 회사 구성원 정보 업데이트
app.put('/api/admin/members', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { title, subtitle, members } = req.body;

        // 실제로는 데이터베이스에 저장
        // 여기서는 메모리에 임시 저장
        global.membersInfo = { title, subtitle, members };

        res.json({
            message: '회사 구성원 정보가 성공적으로 업데이트되었습니다.',
            members: { title, subtitle, members }
        });
    } catch (error) {
        console.error('구성원 정보 업데이트 실패:', error);
        res.status(500).json({ message: '구성원 정보 업데이트에 실패했습니다.' });
    }
});

// 회사 가치 정보 조회
app.get('/api/admin/values', authenticateToken, requireAdmin, (req, res) => {
    try {
        const valuesInfo = global.valuesInfo || {
            title: '우리의 가치',
            subtitle: 'HTeng이 추구하는 핵심 가치입니다',
            values: [
                {
                    title: '혁신',
                    description: '끊임없는 연구개발을 통해 최고의 기술을 제공합니다.',
                    icon: 'fas fa-lightbulb'
                },
                {
                    title: '신뢰',
                    description: '고객과의 약속을 지키고 안전한 제품을 제공합니다.',
                    icon: 'fas fa-handshake'
                },
                {
                    title: '성장',
                    description: '직원과 회사의 지속적인 성장을 추구합니다.',
                    icon: 'fas fa-chart-line'
                }
            ]
        };

        res.json(valuesInfo);
    } catch (error) {
        console.error('회사 가치 정보 조회 실패:', error);
        res.status(500).json({ message: '회사 가치 정보 조회에 실패했습니다.' });
    }
});

// 회사 가치 정보 업데이트
app.put('/api/admin/values', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { title, subtitle, values } = req.body;

        // 실제로는 데이터베이스에 저장
        // 여기서는 메모리에 임시 저장
        global.valuesInfo = { title, subtitle, values };

        res.json({
            message: '회사 가치 정보가 성공적으로 업데이트되었습니다.',
            values: { title, subtitle, values }
        });
    } catch (error) {
        console.error('회사 가치 정보 업데이트 실패:', error);
        res.status(500).json({ message: '회사 가치 정보 업데이트에 실패했습니다.' });
    }
});

/**
 * @swagger
 * /api/admin/summary:
 *   get:
 *     summary: 관리자 대시보드 요약 정보
 *     responses:
 *       200: { description: 요약 정보 }
 *       401: { description: 토큰 누락 }
 *       403: { description: 권한 부족 }
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
 */
app.get('/api/products', (req, res) => {
    res.json(eocrProducts);
});

/**
 * @swagger
 * /api/products/filter:
 *   get:
 *     summary: EOCR 제품 필터 검색
 */
app.get('/api/products/filter', (req, res) => {
    let filtered = [...eocrProducts];
    const {
        제품명, 상세설명, AC_DC, 제품군, 보호종류, 통신여부, 통신종류,
        누설_지락, 단락, 과전류_저전류, 결상, 역상, 과전압_저전압, 전력, 내장_ZCT
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
 */
app.get('/api/products/suggest', (req, res) => {
    const { q } = req.query;
    if (!q || q.trim() === '') return res.json([]);
    const suggestions = Array.from(
        new Set(
            eocrProducts
                .map(p => p.제품)
                .filter(name => name && name.toLowerCase().includes(q.toLowerCase()))
        )
    ).slice(0, 10);
    res.json(suggestions);
});

// 소개 페이지 정보 조회
app.get('/api/admin/intro-pages', authenticateToken, requireAdmin, (req, res) => {
    try {
        const introPages = {
            ceo: global.ceoInfo || {
                name: '홍길동',
                position: '대표이사',
                introduction: '안녕하세요. HT ENG 대표이사 홍길동입니다. 저희 HT ENG는 끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장해왔습니다. 앞으로도 여러분의 기대에 부응하며 지속 가능한 기업으로 나아가겠습니다. 감사합니다.',
                vision: '끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장',
                image: 'CEO.jpeg'
            },
            members: global.membersInfo || {
                title: '직원 소개',
                subtitle: '전문성과 열정으로 고객의 성공을 만들어갑니다',
                members: [
                    {
                        name: '민과장',
                        position: '과장',
                        department: '기술팀',
                        description: '경력 3년의 전문성을 바탕으로 고객에게 최적의 솔루션을 제공합니다.',
                        image: 'CEO.jpeg',
                        experience: '3년',
                        email: 'chulsoo@hteng.com'
                    },
                    {
                        name: '정태주',
                        position: '기술팀',
                        department: '기술팀',
                        description: '신입으로서 열정과 창의성을 바탕으로 새로운 아이디어를 제안합니다.',
                        image: 'CEO.jpeg',
                        experience: '1년',
                        email: 'younghee@hteng.com'
                    }
                ]
            },
            values: global.valuesInfo || {
                title: '우리의 가치',
                subtitle: 'HTeng이 추구하는 핵심 가치입니다',
                values: [
                    {
                        title: '혁신',
                        description: '끊임없는 연구개발을 통해 최고의 기술을 제공합니다.',
                        icon: 'fas fa-lightbulb'
                    },
                    {
                        title: '신뢰',
                        description: '고객과의 약속을 지키고 안전한 제품을 제공합니다.',
                        icon: 'fas fa-handshake'
                    },
                    {
                        title: '성장',
                        description: '직원과 회사의 지속적인 성장을 추구합니다.',
                        icon: 'fas fa-chart-line'
                    }
                ]
            },
            company: global.companyInfo || {
                name: 'HTENG',
                description: 'HTENG는 전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다. 고객과의 신뢰를 바탕으로 지속적인 성장과 혁신을 추구합니다.',
                phone: '031-123-4567',
                email: 'info@hteng.com',
                fax: '031-123-4568',
                website: 'https://www.hteng.com',
                hours: '월-금 09:00-18:00',
                history: [
                    { year: '2025', event: '웹 리뉴얼 및 온라인 기술 지원 시작' },
                    { year: '2020', event: '이튼·르그랑 공식 파트너 체결' },
                    { year: '2010', event: 'HTENG 설립' }
                ],
                business: '산업 자동화 제품 유통, 전기 부품 판매, 현장 기술 컨설팅 및 유지보수',
                location: '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호',
                businessItems: [
                    { title: '산업 자동화 제품 유통', description: '공장 자동화에 필요한 제품들을 공급합니다.' },
                    { title: '전기 부품 판매', description: '고품질 전기 부품을 합리적인 가격으로 제공합니다.' },
                    { title: '현장 기술 컨설팅 및 유지보수', description: '전문 기술진이 현장에서 직접 지원합니다.' }
                ]
            }
        };

        res.json(introPages);
    } catch (error) {
        console.error('소개 페이지 정보 조회 실패:', error);
        res.status(500).json({ message: '소개 페이지 정보 조회에 실패했습니다.' });
    }
});

// 소개 페이지 정보 업데이트
app.put('/api/admin/intro-pages/:pageType', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { pageType } = req.params;
        const pageData = req.body;

        switch (pageType) {
            case 'ceo':
                global.ceoInfo = pageData;
                break;
            case 'members':
                global.membersInfo = pageData;
                break;
            case 'values':
                global.valuesInfo = pageData;
                break;
            case 'company':
                global.companyInfo = pageData;
                break;
            default:
                return res.status(400).json({ message: '유효하지 않은 페이지 타입입니다.' });
        }

        res.json({
            message: `${pageType} 페이지 정보가 성공적으로 업데이트되었습니다.`,
            data: pageData
        });
    } catch (error) {
        console.error('소개 페이지 정보 업데이트 실패:', error);
        res.status(500).json({ message: '소개 페이지 정보 업데이트에 실패했습니다.' });
    }
});

// 공개 소개 페이지 정보 조회 (인증 불필요)
app.get('/api/intro-pages', (req, res) => {
    try {
        const introPages = {
            ceo: global.ceoInfo || {
                name: '홍길동',
                position: '대표이사',
                introduction: '안녕하세요. HT ENG 대표이사 홍길동입니다. 저희 HT ENG는 끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장해왔습니다. 앞으로도 여러분의 기대에 부응하며 지속 가능한 기업으로 나아가겠습니다. 감사합니다.',
                vision: '끊임없는 기술 혁신과 고객 만족을 최우선으로 생각하며, 신뢰와 품질을 바탕으로 성장',
                image: 'CEO.jpeg'
            },
            members: global.membersInfo || {
                title: '직원 소개',
                subtitle: '전문성과 열정으로 고객의 성공을 만들어갑니다',
                members: [
                    {
                        name: '민과장',
                        position: '과장',
                        department: '기술팀',
                        description: '경력 3년의 전문성을 바탕으로 고객에게 최적의 솔루션을 제공합니다.',
                        image: 'CEO.jpeg',
                        experience: '3년',
                        email: 'chulsoo@hteng.com'
                    },
                    {
                        name: '정태주',
                        position: '기술팀',
                        department: '기술팀',
                        description: '신입으로서 열정과 창의성을 바탕으로 새로운 아이디어를 제안합니다.',
                        image: 'CEO.jpeg',
                        experience: '1년',
                        email: 'younghee@hteng.com'
                    }
                ]
            },

            company: global.companyInfo || {
                title: '회사 소개',
                subtitle: 'HTeng이 추구하는 핵심 가치입니다',
                name: 'HTENG',
                description: 'HTENG는 전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다. 고객과의 신뢰를 바탕으로 지속적인 성장과 혁신을 추구합니다.',
                phone: '031-123-4567',
                email: 'info@hteng.com',
                fax: '031-123-4568',
                website: 'https://www.hteng.com',
                hours: '월-금 09:00-18:00',
                history: [
                    { year: '2025', event: '웹 리뉴얼 및 온라인 기술 지원 시작' },
                    { year: '2020', event: '이튼·르그랑 공식 파트너 체결' },
                    { year: '2010', event: 'HTENG 설립' }
                ],
                business: '산업 자동화 제품 유통, 전기 부품 판매, 현장 기술 컨설팅 및 유지보수',
                location: '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호',
                businessItems: [
                    { title: '산업 자동화 제품 유통', description: '공장 자동화에 필요한 제품들을 공급합니다.' },
                    { title: '전기 부품 판매', description: '고품질 전기 부품을 합리적인 가격으로 제공합니다.' },
                    { title: '현장 기술 컨설팅 및 유지보수', description: '전문 기술진이 현장에서 직접 지원합니다.' }
                ]
            }
        };

        res.json(introPages);
    } catch (error) {
        console.error('공개 소개 페이지 정보 조회 실패:', error);
        res.status(500).json({ message: '소개 페이지 정보 조회에 실패했습니다.' });
    }
});

// 회사 소개 페이지 정보 업데이트
app.put('/api/admin/company-intro', authenticateToken, requireAdmin, (req, res) => {
    try {
        const { title, subtitle, name, description, location, history, businessItems } = req.body;

        // 회사 소개 페이지 정보 업데이트
        global.companyIntroInfo = {
            title: title || '회사 소개',
            subtitle: subtitle || 'HTeng이 추구하는 핵심 가치입니다',
            name: name || 'HTENG',
            description: description || '',
            location: location || '',
            history: history || [],
            businessItems: businessItems || []
        };

        res.json({
            message: '회사 소개 페이지 정보가 성공적으로 업데이트되었습니다.',
            data: global.companyIntroInfo
        });
    } catch (error) {
        console.error('회사 소개 페이지 정보 업데이트 실패:', error);
        res.status(500).json({ message: '회사 소개 페이지 정보 업데이트에 실패했습니다.' });
    }
});

// 회사 소개 페이지 정보 조회
app.get('/api/admin/company-intro', authenticateToken, requireAdmin, (req, res) => {
    try {
        const companyIntroInfo = global.companyIntroInfo || {
            title: '회사 소개',
            subtitle: 'HTeng이 추구하는 핵심 가치입니다',
            name: 'HTENG',
            description: 'HTENG는 전기·전자 부품 유통 및 기술 지원 서비스를 제공하는 전문 기업입니다. 고객과의 신뢰를 바탕으로 지속적인 성장과 혁신을 추구합니다.',
            location: '경기도 김포시 태장로 795번길 23 마스터비즈파크 340호',
            history: [
                { year: '2025', event: '웹 리뉴얼 및 온라인 기술 지원 시작' },
                { year: '2020', event: '이튼·르그랑 공식 파트너 체결' },
                { year: '2010', event: 'HTENG 설립' }
            ],
            businessItems: [
                { item: '산업 자동화 제품 유통' },
                { item: '전기 부품 판매' },
                { item: '현장 기술 컨설팅 및 유지보수' }
            ]
        };

        res.json(companyIntroInfo);
    } catch (error) {
        console.error('회사 소개 페이지 정보 조회 실패:', error);
        res.status(500).json({ message: '회사 소개 페이지 정보 조회에 실패했습니다.' });
    }
});

// 메인페이지 데이터 가져오기 (공개)
app.get('/api/main-page', (req, res) => {
    res.json(global.mainPageData);
});

// 메인페이지 데이터 업데이트 (관리자)
app.put('/api/admin/main-page', authenticateToken, (req, res) => {
    try {
        const { banner, brands, contact, descriptions } = req.body;

        // 데이터 유효성 검사
        if (banner) global.mainPageData.banner = banner;
        if (brands) global.mainPageData.brands = brands;
        if (contact) global.mainPageData.contact = contact;
        if (descriptions) global.mainPageData.descriptions = descriptions;

        res.json({
            message: '메인페이지 데이터가 업데이트되었습니다.',
            data: global.mainPageData
        });
    } catch (error) {
        res.status(500).json({ error: '메인페이지 데이터 업데이트 중 오류가 발생했습니다.' });
    }
});

app.listen(PORT, () => {
    console.log(`서버가 실행 중입니다! http://localhost:${PORT}`);
    console.log(`환경: ${NODE_ENV}`);
    if (NODE_ENV === 'production') {
        console.log(`프로덕션 서버: https://hteng.co.kr`);
    }
    console.log(`Swagger 문서: http://localhost:${PORT}/api-docs`);
});