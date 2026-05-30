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
