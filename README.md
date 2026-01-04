# IOC-HUB (Jormungand Threat Intelligence Platform)



IOC-HUB adalah **Threat Intelligence Platform** berbasis web yang digunakan untuk mengelola dan menganalisis **Indicators of Compromise (IOC)** seperti URL berbahaya, host, payload malware, dan data intelijen lainnya.  
Platform ini juga terintegrasi dengan **URLhaus** untuk sinkronisasi dan query ancaman eksternal.(saat ini hanya URL)

---

## ✨ Fitur Utama

- 🔐 **Autentikasi JWT (Access & Refresh Token)**
- 👤 **Role-based Access Control** (Admin & User)
- 📦 **Manajemen URL** (Create, Read, Update, Delete)
- 🌐 **Integrasi URLhaus API**
- 📊 **Statistik URL**
- 🖥️ **Frontend Dashboard (Admin & User)**
- 🗄️ **Database SQLite (Sequelize ORM)**

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
<img width="1918" height="993" alt="Screenshot 2026-01-04 082718" src="https://github.com/user-attachments/assets/85fdc8a4-fd5c-4fdd-8376-92afae86ae61" />

### admin
<img width="1919" height="1079" alt="Screenshot 2026-01-04 082745" src="https://github.com/user-attachments/assets/019c3ec5-076e-4611-94a8-f78728f14316" />

<img width="1919" height="1079" alt="Screenshot 2026-01-04 082754" src="https://github.com/user-attachments/assets/38c31ce0-6c88-48ca-8ef3-f60f5d39503a" />

---

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
