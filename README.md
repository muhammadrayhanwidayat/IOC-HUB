# IOC-HUB (Jormungand Threat Intelligence Platform)


IOC-HUB adalah sebuah platform intelijen ancaman yang dirancang untuk mengelola, membagikan, dan melakukan kueri terhadap Indicators of Compromise (IOC). Platform ini terintegrasi dengan data ancaman spesifik dari URLHaus dan menyediakan API yang aman baik untuk analis manusia (melalui Web Dashboard) maupun sistem otomatis (melalui API Key).

---

## Fitur Utama

* **Dashboard**: Antarmuka web yang ramah pengguna untuk melihat statistik dan mengelola IOC.
* **Autentikasi Ganda**:

  * **JWT** untuk akses web yang aman.
  * **API Key** untuk otomatisasi dan integrasi skrip yang mulus.
* **Kontrol Akses Berbasis Peran (RBAC)**:
  
  * **Admin**: Kontrol penuh (Create, Read, Update, Delete), Sinkronisasi URLHaus.
  * **User**: Akses hanya-baca dan kemampuan Query.
* **Integrasi URLHaus**: Sinkronisasi URL berbahaya terbaru dan Payload langsung dari URLHaus.
* **RESTful API**: Endpoint yang terdokumentasi sepenuhnya untuk integrasi kustom.


---
## tampilan web
### home
<img width="1919" height="1079" alt="Screenshot 2026-01-04 082625" src="https://github.com/user-attachments/assets/37a6e8e3-b448-4a15-a8f8-bd2a77a6b797" />

### register
<img width="1919" height="1079" alt="Screenshot 2026-01-04 082634" src="https://github.com/user-attachments/assets/b39619e9-7e5a-424d-93b8-cd56c11e4d48" />

### login
<img width="1919" height="1079" alt="Screenshot 2026-01-04 082641" src="https://github.com/user-attachments/assets/d9deb70a-86b1-4e77-8360-ca7efba9164a" />

### health
<img width="624" height="528" alt="Screenshot 2026-01-04 082655" src="https://github.com/user-attachments/assets/fc80f76e-fbb1-4823-b6d9-008a784d0a3a" />

### dashboard
<img width="1868" height="844" alt="image" src="https://github.com/user-attachments/assets/6432b918-50eb-4150-a5f9-d8838f3f1679" />

### admin
<img width="1919" height="1079" alt="Screenshot 2026-01-04 082745" src="https://github.com/user-attachments/assets/019c3ec5-076e-4611-94a8-f78728f14316" />

<img width="1919" height="1079" alt="Screenshot 2026-01-04 082754" src="https://github.com/user-attachments/assets/38c31ce0-6c88-48ca-8ef3-f60f5d39503a" />

---
## Arsitektur
### General System Architecture
<img width="2634" height="1173" alt="diagram-export-1-4-2026-8_43_46-AM" src="https://github.com/user-attachments/assets/76db22bf-541b-4eae-9292-5cadaabdd285" />

### friendly diagram
<img width="792" height="727" alt="image" src="https://github.com/user-attachments/assets/c1b7b538-e8aa-4ca1-b840-05c2565368bb" />


### 3 Tier Architecture (IOC-HUB)

#### 1.Presentation Layer
**Komponen**
- Web Dashboard (Admin & User)
- API Client (Browser / HTTP Client)

**Teknologi**
HTML
- Tailwind CSS
- JavaScript (Vanilla JS)

**menampilkan**
- Dashboard IOC (statistik ancaman)
- Daftar & detail IOC
- Status sinkronisasi URLhaus
- Informasi user & role
- Hasil query ancaman (URL)
- Health status sistem

#### 2.Application Layer
**Komponen**
- API Gateway Server (Node.js + Express)
- Middleware Security
- Controller & Service Layer

**Business Logic**
Authentication & Authorization
- Login, Register, Logout
- JWT Access & Refresh Token
  
Role-Based Access Control
- Admin
- User

IOC Management
- Create, Read, Update, Delete IOC

Threat Intelligence Integration
- URLhaus URL Query

IOC Statistics & Reporting

**Security**
- JWT Authentication
- Refresh Token Validation
- Role-Based Access Control
- Input Validation & Sanitization
- Error Handling & Logging

#### 2.Data Layer
**Database**
- SQLite (Sequelize ORM)

Tabel Utama
- User
(username, email, password hash, role, refresh token)
- IOC
(type, value, threat, status, source, metadata)


## 3.API Endpoint
**Authentication & User Management**
| Method | Endpoint             | Deskripsi                           |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/auth/register` | Mendaftarkan user baru              |
| POST   | `/api/auth/login`    | Login user dan generate JWT         |
| POST   | `/api/auth/refresh`  | Generate ulang access token         |
| POST   | `/api/auth/logout`   | Logout dan invalidate refresh token |
| GET    | `/api/auth/profile`  | Melihat profil user (perlu login)   |

**IOC Management**
| Method | Endpoint         | Deskripsi                 |
| ------ | ---------------- | ------------------------- |
| GET    | `/api/ioc`       | Melihat daftar IOC        |
| GET    | `/api/ioc/:id`   | Detail IOC                |
| POST   | `/api/ioc`       | Menambah IOC (Admin only) |
| PUT    | `/api/ioc/:id`   | Update IOC (Admin only)   |
| DELETE | `/api/ioc/:id`   | Hapus IOC (Admin only)    |
| GET    | `/api/ioc/stats` | Statistik IOC             |

**Cyber Threat Intelligence Services (URLhaus)**
| Method | Endpoint                     | Deskripsi & Response                                 |
| ------ | ---------------------------- | ---------------------------------------------------- |
| POST   | `/api/urlhaus/query/url`     | Mengecek URL berbahaya<br>Response: JSON threat data |
| POST   | `/api/urlhaus/query/host`    | Mengecek host/IP<br>Response: JSON                   |
| POST   | `/api/urlhaus/query/payload` | Mengecek payload malware<br>Response: JSON           |
| POST   | `/api/urlhaus/query/tag`     | Query berdasarkan tag ancaman<br>Response: JSON      |
| GET    | `/api/urlhaus/sync/urls`     | Sinkronisasi URL terbaru (Admin)                     |
| GET    | `/api/urlhaus/sync/payloads` | Sinkronisasi payload malware (Admin)                 |

**System & Monitoring**
| Method | Endpoint      | Deskripsi               |
| ------ | ------------- | ----------------------- |
| GET    | `/api/health` | Mengecek status backend |


## 4. Alur Kerja Sistem
- User mengakses Web Dashboard
- User login → backend mengeluarkan JWT
- Client menyimpan JWT dan mengirimkannya di setiap request
- Backend memvalidasi JWT & role
- Controller memproses permintaan
- Database atau URLhaus API diakses
- Response dikembalikan ke client dalam format JSON

## 🛠️ Teknologi yang Digunakan

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite
- JSON Web Token (JWT)
- bcryptjs
- axios

### Frontend
- HTML5
- Tailwind CSS
- Vanilla JavaScript

---

## 📁 Struktur Proyek

```

IOC-HUB/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── database.sqlite
│   ├── config/
│   │   ├── database.js
│   │   ├── jwt.js
│   │   └── config.json
│   ├── models/
│   │   ├── User.js
│   │   ├── IOC.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── iocController.js
│   │   └── urlhausController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ioc.js
│   │   └── urlhaus.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   └── services/
│       └── urlhausService.js
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── admin.html
│   ├── health.html
│   └── assets/
│       └── js/
│           ├── common.js
│           ├── dashboard.js
│           └── admin.js
│
└── README.md

````

---

## 🚀 Cara Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/username/IOC-HUB.git
cd IOC-HUB/backend
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Konfigurasi Environment Variable

Buat file `.env` di folder `backend/`:

```env
PORT=3000
NODE_ENV=development

DB_PATH=./database.sqlite

JWT_ACCESS_SECRET=replace_with_strong_random_string
JWT_REFRESH_SECRET=replace_with_strong_random_string
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_EMAIL=admin@iochub.local

URLHAUS_API_BASE=https://urlhaus-api.abuse.ch/v1
URLHAUS_API_KEY=your_urlhaus_api_key
```

> ⚠️ **PENTING:** Ganti JWT secret dan password admin sebelum deployment ke production.

---

### 4. Jalankan Server

```bash
npm start
```

atau (jika menggunakan nodemon):

```bash
npm run dev
```

### 5. Akses Aplikasi

* Frontend: `http://localhost:3000`
* API Base URL: `http://localhost:3000/api`

---

## 🔑 Akun Default

Jika database masih kosong, sistem akan otomatis membuat akun admin:

```
Username: admin
Password: admin123
Role    : admin
```

> ⚠️ Disarankan untuk mengganti atau menonaktifkan akun default ini di environment production.

---

## 🔌 Endpoint API Utama

### Auth

* `POST /api/auth/register`
* `POST /api/auth/login`
* `POST /api/auth/refresh`
* `POST /api/auth/logout`
* `GET  /api/auth/profile`

### IOC

* `GET    /api/ioc`
* `GET    /api/ioc/:id`
* `POST   /api/ioc` (Admin)
* `PUT    /api/ioc/:id` (Admin)
* `DELETE /api/ioc/:id` (Admin)
* `GET    /api/ioc/stats`

### URLhaus

* `POST /api/urlhaus/query/url`
* `POST /api/urlhaus/query/host`
* `POST /api/urlhaus/query/payload`
* `POST /api/urlhaus/query/tag`
* `GET  /api/urlhaus/sync/urls` (Admin)
* `GET  /api/urlhaus/sync/payloads` (Admin)

---

## Penggunaan API

### Authentication
You can authenticate using either a **Bearer Token** (Login required) or an **API Key**.

#### 1. Using API Key
Add the following header to your requests:
```http
x-api-key: YOUR_API_KEY
```

#### 2. Using JWT (Login)
1.  **POST** `/api/auth/login` with `username` and `password`.
2.  Use the returned `accessToken` in the Authorization header:
    ```http
    Authorization: Bearer YOUR_ACCESS_TOKEN
