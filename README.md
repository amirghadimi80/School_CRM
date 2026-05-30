# 🎓 سپاد - سامانه یکپارچه مدیریت مدرسه

<div align="center">

[![Django](https://img.shields.io/badge/Django%20REST%20Framework-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![Next.js](https://img.shields.io/badge/Next.js%2014-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**🌐 [Live Demo](https://sepaad-demo.vercel.app)** | **📚 [API Docs](https://sepaad-api.onrender.com/api/docs/)** | **📄 [Documentation](https://github.com/yourusername/sepaad/wiki)**

</div>

<div dir="rtl">

## 🎯 معرفی پروژه

**سپاد** یک پلتفرم جامع **SaaS** برای مدیریت مدارس است که با معماری مدرن **Multi-Tenant** طراحی شده و پشتیبانی کامل از زبان فارسی، تقویم شمسی و واحد پول تومان را داراست.

این پروژه نمونه‌ای از توانایی‌های فنی در طراحی سیستم‌های مقیاس‌پذیر، امن و کاربرپسند است.

</div>

---

## 📸 اسکرین‌شات‌ها

> ⚠️ **نکته:** عکس‌های زیر باید اضافه شوند. پیشنهاد می‌کنم از UI فعلی اسکرین‌شات بگیری و در پوشه `screenshots/` قرار بدی.

<div align="center">

| 🖥️ داشبورد ادمین | 📱 ریسپانسیو موبایل | 👨‍🏫 پنل معلم |
|:---:|:---:|:---:|
| ![Dashboard](./screenshots/dashboard.png) | ![Mobile](./screenshots/mobile.png) | ![Teacher](./screenshots/teacher.png) |

| 📝 کارنامه دانش‌آموز | 💰 مدیریت مالی | 📊 گزارش‌گیری |
|:---:|:---:|:---:|
| ![Grades](./screenshots/grades.png) | ![Finance](./screenshots/finance.png) | ![Analytics](./screenshots/analytics.png) |

</div>

---

## 🏗️ معماری سیستم

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Admin     │  │   Teacher   │  │   Student   │             │
│  │   Panel     │  │   Panel     │  │   Panel     │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼────────────────┼───────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Next.js   │
                    │   (React)   │
                    └──────┬──────┘
                           │ HTTPS
┌──────────────────────────┼──────────────────────────────────────┐
│                    API Gateway (Nginx)                          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    Django REST Framework                        │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │   Users     │  Students   │  Teachers   │   Classes   │     │
│  │   (JWT)     │   (CRUD)    │(Assignments)│ (Schedule) │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐     │
│  │  Attendance │   Grades    │   Finance   │ Analytics   │     │
│  │ (Daily API) │(Report API) │ (Invoicing) │(Dashboard) │     │
│  └─────────────┴─────────────┴─────────────┴─────────────┘     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ PostgreSQL  │ │    Redis    │ │   Celery    │
    │  (Primary)  │ │  (Cache/    │ │ (Background │
    │   (Multi-   │ │   Queue)    │ │    Tasks)   │
    │   Tenant)   │ │             │ │             │
    └─────────────┘ └─────────────┘ └─────────────┘
```

---

## ⚡ ویژگی‌های کلیدی

<div dir="rtl">

### 🔐 امنیت و احراز هویت
- **JWT Authentication** با قابلیت Refresh Token
- **RBAC** (Role-Based Access Control) با ۶ نقش مختلف
- **Multi-Tenancy** با جداسازی کامل داده‌ها
- **Row-Level Security** در PostgreSQL

### 📱 تجربه کاربری
- **RTL Full Support** - پشتیبانی کامل راست‌چین
- **Jalali Calendar** - تقویم شمسی کامل
- **Toman Currency** - فرمت‌بندی خودکار پول
- **Dark/Light Mode** - تم تیره/روشن
- **Responsive Design** - پشتیبانی موبایل و تبلت

### ⚡ پرفورمنس
- **React Query** - کشینگ هوشمند در سمت کلاینت
- **Redis Caching** - کشینگ API در سرور
- **Database Indexing** - ایندکس بهینه برای کوئری‌های پرتکرار
- **Lazy Loading** - لود تدریجی کامپوننت‌ها

</div>

---

## 🛠️ تکنولوژی‌ها

### Backend
| تکنولوژی | کاربرد |
|----------|--------|
| **Django 5.0** | فریم‌ورک اصلی بک‌اند |
| **DRF** | REST API |
| **PostgreSQL 15** | دیتابیس رابطه‌ای |
| **Redis** | کش و صف پیام |
| **Celery** | تسک‌های پس‌زمینه |
| **JWT** | احراز هویت |

### Frontend
| تکنولوژی | کاربرد |
|----------|--------|
| **Next.js 14** | فریم‌ورک React |
| **TypeScript** | تایپ استاتیک |
| **TailwindCSS** | استایل‌دهی |
| **shadcn/ui** | کامپوننت‌های UI |
| **React Query** | مدیریت داده |
| **Zod** | اعتبارسنجی فرم |

---

## 🚀 راه‌اندازی سریع

### روش ۱: Docker (توصیه شده)

```bash
# کلون کردن
git clone https://github.com/yourusername/sepaad.git
cd sepaad

# تنظیمات
cp backend/.env.example backend/.env
# ویرایش backend/.env

# اجرا
docker-compose up -d

# Migration و سوپر یوزر
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

### روش ۲: توسعه محلی

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
python manage.py runserver

# Frontend (ترمینال جدا)
cd frontend
npm install
npm run dev
```

### 🌐 دسترسی
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1/
- **API Docs:** http://localhost:8000/api/docs/

---

## 📡 API Endpoints

### 🔐 احراز هویت
```
POST   /api/v1/auth/login/          # ورود
POST   /api/v1/auth/refresh/        # تمدید توکن
POST   /api/v1/auth/logout/         # خروج
GET    /api/v1/auth/me/             # اطلاعات کاربر
```

### 👨‍🏫 پنل معلم
```
GET    /api/v1/users/teacher/dashboard/         # داشبورد
GET    /api/v1/users/teacher/schedule/          # برنامه هفتگی
GET    /api/v1/users/teacher/classes/           # کلاس‌ها
GET    /api/v1/users/teacher/class_attendance/  # حضور و غیاب
POST   /api/v1/users/teacher/mark_attendance/   # ثبت حضور
GET    /api/v1/users/teacher/class_grades/     # نمرات
POST   /api/v1/users/teacher/add_grade/         # ثبت نمره
```

### 👨‍🎓 پنل دانش‌آموز
```
GET    /api/v1/users/student/dashboard/     # داشبورد
GET    /api/v1/users/student/schedule/      # برنامه هفتگی
GET    /api/v1/users/student/grades/        # کارنامه
GET    /api/v1/users/student/attendance/    # حضور و غیاب
GET    /api/v1/users/student/finance/       # وضعیت مالی
```

---

## 🎨 سیستم نقش‌ها

| نقش | دسترسی‌ها | استفاده‌کننده |
|-----|-----------|---------------|
| 🔴 **Super Admin** | مدیریت کامل سیستم | تیم توسعه |
| 🟠 **School Admin** | مدیریت یک مدرسه | مدیر مدرسه |
| 🟡 **Teacher** | کلاس‌ها، نمرات، حضور | معلمان |
| 🟢 **Student** | مشاهده اطلاعات شخصی | دانش‌آموزان |
| 🔵 **Parent** | مشاهده فرزند | والدین |
| 🟣 **Accountant** | امور مالی | حسابدار |

---

## 🧪 تست و کیفیت

```bash
# Backend tests
docker-compose exec backend pytest --cov=apps --cov-report=html

# Frontend tests
cd frontend
npm test -- --coverage

# Linting
cd backend && flake8
cd frontend && npm run lint
```

---

## 📦 Deployment

### ☁️ پلتفرم‌های پیشنهادی

| سرویس | کاربرد | لینک |
|-------|--------|------|
| **Vercel** | Frontend | [vercel.com](https://vercel.com) |
| **Render** | Backend + DB | [render.com](https://render.com) |
| **Railway** | Fullstack | [railway.app](https://railway.app) |

### 🐳 Docker Production

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## 🤝 مشارکت

مشارکت شما خوشحالمان می‌کند! لطفاً قبل از PR کردن:

1. Issue مرتبط را چک کنید
2. Branch بسازید: `git checkout -b feature/amazing-feature`
3. تست بنویسید
4. PR Template را پر کنید

[Contribution Guide](./CONTRIBUTING.md) | [Code of Conduct](./CODE_OF_CONDUCT.md)

---

## 🗺️ Roadmap

- [x] ✅ سیستم احراز هویت JWT
- [x] ✅ پنل‌های معلم و دانش‌آموز
- [x] ✅ مدیریت مالی
- [x] ✅ حضور و غیاب
- [x] ✅ کارنامه و نمرات
- [ ] 🔄 پیام‌رسانی داخلی
- [ ] 🔄 اپلیکیشن موبایل (React Native)
- [ ] 🔄 هوش مصنوعی برای تحلیل نمرات
- [ ] 🔄 سیستم آزمون آنلاین

---

## 📞 تماس

<div dir="rtl">

- 🌐 **وبسایت:** [sepaad.ir](https://sepaad.ir)
- 📧 **ایمیل:** contact@sepaad.ir
- 💬 **تلگرام:** [@sepaad_support](https://t.me/sepaad_support)

</div>

---

## 📄 License

این پروژه تحت لایسنس [MIT](./LICENSE) منتشر شده است.

---

<div align="center">

**⭐ اگر این پروژه برایت مفید بود، ستاره بده!**

**ساخته شده با ❤️ در ایران**

</div>

![Django](https://img.shields.io/badge/Django-5.0-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)

</div>

## 🚀 ویژگی‌ها

<div dir="rtl">

### امکانات اصلی
- ✅ **مدیریت چند مدرسه‌ای** - پشتیبانی از چندین مدرسه در یک پلتفرم
- ✅ **مدیریت دانش‌آموزان** - ثبت‌نام، اطلاعات شخصی، مدارک
- ✅ **مدیریت معلمان** - اطلاعات استخدامی، تخصیص کلاس
- ✅ **مدیریت کلاس‌ها** - برنامه‌ریزی درسی، ظرفیت‌سنجی
- ✅ **حضور و غیاب** - ثبت روزانه، گزارش‌گیری، هشدار غیبت
- ✅ **نمره‌دهی** - کارنامه، میانگین‌گیری، نمودار پیشرفت
- ✅ **مالی** - شهریه، پرداخت‌ها، تخفیف، مطالبات
- ✅ **اعلانات** - پیامک، ایمیل، نوتیفیکیشن
- ✅ **گزارش‌گیری** - داشبورد تحلیلی، نمودارها

### ویژگی‌های فنی
- 🔒 **احراز هویت JWT** - امن و قابل اعتماد
- 🔐 **کنترل دسترسی RBAC** - نقش‌های متنوع
- 🌍 **چند مستأجری** - جداسازی داده‌ها
- 📱 **واکنش‌گرا** - پشتیبانی از موبایل و تبلت
- 🌙 **تم تیره/روشن** - قابل تغییر
- 📅 **تقویم شمسی** - کامل فارسی‌سازی شده
- 💰 **واحد پول تومان** - فرمت‌بندی خودکار

</div>

## 📁 ساختار پروژه

```
sepaad/
├── backend/                    # Django Backend
│   ├── apps/                   # Django Apps
│   │   ├── common/             # Middleware و Permissions مشترک
│   │   ├── core/               # مدل‌های پایه
│   │   ├── schools/            # مدیریت مدارس
│   │   ├── users/              # احراز هویت و کاربران
│   │   ├── students/           # مدیریت دانش‌آموزان
│   │   ├── teachers/           # مدیریت معلمان
│   │   ├── classes/            # مدیریت کلاس‌ها
│   │   ├── attendance/         # حضور و غیاب
│   │   ├── grades/             # نمرات و کارنامه
│   │   ├── finance/            # مدیریت مالی
│   │   ├── notifications/      # اعلانات
│   │   └── analytics/          # گزارش‌گیری
│   ├── config/                 # تنظیمات Django
│   ├── requirements/           # Dependencies
│   ├── manage.py
│   └── Dockerfile
├── frontend/                   # Next.js Frontend
│   ├── app/                    # App Router
│   │   ├── auth/login/         # صفحه ورود
│   │   └── dashboard/          # داشبورد
│   ├── components/
│   │   ├── ui/                 # کامپوننت‌های shadcn/ui
│   │   ├── layout/             # Layout ها
│   │   └── providers.tsx       # Providers
│   ├── lib/                    # Utility functions
│   ├── hooks/                  # React hooks
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml          # Docker Compose
└── .env.example               # نمونه متغیرهای محیطی
```

## 🛠️ راه‌اندازی

### پیش‌نیازها
- Docker و Docker Compose
- Git

### مراحل نصب

1. **کلون کردن پروژه:**
```bash
git clone <repository-url>
cd sepaad
```

2. **تنظیم متغیرهای محیطی:**
```bash
cp backend/.env.example backend/.env
# ویرایش backend/.env با مقادیر مناسب
```

3. **اجرای با Docker:**
```bash
docker-compose up -d
```

4. **اجرای migration ها:**
```bash
docker-compose exec backend python manage.py migrate
```

5. **ایجاد سوپر یوزر:**
```bash
docker-compose exec backend python manage.py createsuperuser
```

6. **دسترسی به سیستم:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/v1/
- Admin: http://localhost:8000/admin

### توسعه محلی

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/dev.txt
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔌 API Endpoints

### احراز هویت
- `POST /api/v1/auth/login/` - ورود
- `POST /api/v1/auth/refresh/` - تمدید توکن
- `POST /api/v1/auth/logout/` - خروج
- `GET /api/v1/auth/me/` - اطلاعات کاربر

### دانش‌آموزان
- `GET /api/v1/students/` - لیست دانش‌آموزان
- `POST /api/v1/students/` - ایجاد دانش‌آموز
- `GET /api/v1/students/{id}/` - جزئیات
- `PUT /api/v1/students/{id}/` - بروزرسانی
- `DELETE /api/v1/students/{id}/` - حذف
- `GET /api/v1/students/{id}/attendance/` - گزارش حضور
- `GET /api/v1/students/{id}/grades/` - نمرات
- `GET /api/v1/students/{id}/finance/` - وضعیت مالی

### معلمان
- `GET /api/v1/teachers/` - لیست معلمان
- `POST /api/v1/teachers/` - ایجاد معلم
- `GET /api/v1/teachers/{id}/` - جزئیات

### کلاس‌ها
- `GET /api/v1/classes/` - لیست کلاس‌ها
- `POST /api/v1/classes/` - ایجاد کلاس
- `GET /api/v1/classes/{id}/` - جزئیات
- `GET /api/v1/classes/{id}/students/` - دانش‌آموزان کلاس
- `GET /api/v1/classes/{id}/schedule/` - برنامه هفتگی

### حضور و غیاب
- `GET /api/v1/attendance/` - لیست
- `POST /api/v1/attendance/` - ثبت حضور
- `GET /api/v1/attendance/stats/` - آمار

### مالی
- `GET /api/v1/finance/invoices/` - فاکتورها
- `POST /api/v1/finance/invoices/` - ایجاد فاکتور
- `GET /api/v1/finance/payments/` - پرداخت‌ها
- `POST /api/v1/finance/payments/` - ثبت پرداخت

## 🎨 سیستم نقش‌ها

| نقش | دسترسی‌ها |
|-----|----------|
| Super Admin | مدیریت کامل سیستم |
| School Admin | مدیریت یک مدرسه |
| Teacher | کلاس‌ها، نمرات، حضور |
| Student | مشاهده اطلاعات شخصی |
| Parent | مشاهده اطلاعات فرزند |
| Accountant | امور مالی |

## 🔧 متغیرهای محیطی

### Backend (.env)
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME=sepaad
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SMS (Kavenegar)
KAVENEGAR_API_KEY=your-api-key
```

## 📱 نمایشگرها

| صفحه | توضیحات |
|------|---------|
| داشبورد | نمای کلی و آمار |
| دانش‌آموزان | مدیریت کامل دانش‌آموزان |
| معلمان | اطلاعات و تخصیص |
| کلاس‌ها | برنامه و ظرفیت |
| حضور و غیاب | ثبت روزانه |
| نمرات | کارنامه و تحلیل |
| مالی | شهریه و پرداخت |
| تنظیمات | پیکربندی مدرسه |

## 🧪 تست

### Backend Tests
```bash
docker-compose exec backend pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📦 Deployment

### Production

1. تنظیم `DEBUG=False` در `.env`
2. استفاده از `prod.txt` برای requirements
3. تنظیم Nginx یا Traefik
4. تنظیم SSL

### Docker Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 📚 مستندات API

### Swagger UI
http://localhost:8000/api/docs/

### ReDoc
http://localhost:8000/api/redoc/

## 🤝 مشارکت

1. Fork کنید
2. Branch بسازید: `git checkout -b feature/amazing-feature`
3. Commit کنید: `git commit -m 'Add amazing feature'`
4. Push کنید: `git push origin feature/amazing-feature`
5. Pull Request بسازید

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 👥 تیم

- توسعه‌دهنده: تیم سپاد
- نسخه: 1.0.0
- تاریخ: 2024

---

<div dir="rtl" align="center">

**ساخته شده با ❤️ در ایران**

</div>
