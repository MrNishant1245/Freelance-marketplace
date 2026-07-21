<<<<<<< HEAD
# Freelance Marketplace — Module 1: Auth & User Management

## Project structure

```
freelance-marketplace/
├── backend/
│   ├── server.js                         # Express entry point
│   ├── .env.example                      # Environment variables template
│   ├── config/
│   │   └── db.js                         # MongoDB connection
│   ├── models/
│   │   └── User.model.js                 # Mongoose user schema (freelancer / client / admin)
│   ├── controllers/
│   │   ├── auth.controller.js            # Register, login, verify, reset password
│   │   ├── profile.controller.js         # Profile update, photo upload, portfolio
│   │   └── user.controller.js            # Admin user management
│   ├── middlewares/
│   │   ├── auth.middleware.js            # JWT protect, authorize, optionalAuth
│   │   ├── validation.middleware.js      # express-validator rules
│   │   ├── upload.middleware.js          # Multer (memory storage)
│   │   └── error.middleware.js           # Global error handler
│   ├── routes/
│   │   ├── auth.routes.js                # /api/auth/*
│   │   ├── profile.routes.js             # /api/profile/*
│   │   └── user.routes.js                # /api/users/* (admin)
│   └── utils/
│       ├── jwt.utils.js                  # Token generation & verification
│       └── email.utils.js                # Nodemailer + HTML email templates
│
└── frontend/
    └── src/
        ├── index.js                      # React entry point
        ├── App.jsx                       # Router + Toaster
        ├── styles/
        │   └── global.css                # CSS variables, base styles, shared classes
        ├── api/
        │   └── index.js                  # Axios client + auto token refresh interceptor
        ├── context/
        │   └── AuthContext.js            # Global auth state (useReducer)
        ├── hooks/
        │   └── useAuth.js                # useAuth, useIsFreelancer, useIsClient, useIsAdmin
        ├── components/
        │   ├── auth/
        │   │   ├── AuthPanel.jsx         # Decorative left panel (role-aware)
        │   │   ├── RoleSelector.jsx      # Client / Freelancer role picker
        │   │   └── ProtectedRoute.jsx    # ProtectedRoute, RoleRoute, GuestRoute
        │   └── common/
        │       └── FormElements.jsx      # FormInput, Alert, Spinner, PasswordStrength
        └── pages/
            └── auth/
                ├── RegisterPage.jsx      # Freelancer + Client registration
                ├── LoginPage.jsx         # Shared login with role tab switcher
                ├── AdminLoginPage.jsx    # Hardened dark-theme admin login
                ├── VerifyEmailPage.jsx   # Email verification via URL token
                ├── ForgotPasswordPage.jsx
                └── ResetPasswordPage.jsx
```

---

## Backend API endpoints

| Method | Endpoint                        | Auth     | Description                        |
|--------|---------------------------------|----------|------------------------------------|
| POST   | /api/auth/register              | —        | Register freelancer or client      |
| POST   | /api/auth/login                 | —        | Login (all roles)                  |
| POST   | /api/auth/refresh-token         | —        | Rotate access/refresh tokens       |
| POST   | /api/auth/logout                | JWT      | Invalidate refresh token           |
| GET    | /api/auth/me                    | JWT      | Get current user                   |
| GET    | /api/auth/verify-email/:token   | —        | Verify email from link             |
| POST   | /api/auth/resend-verification   | JWT      | Resend verification email          |
| POST   | /api/auth/forgot-password       | —        | Send password reset email          |
| POST   | /api/auth/reset-password/:token | —        | Reset password with token          |
| PUT    | /api/auth/change-password       | JWT      | Change password (authenticated)    |
| GET    | /api/profile/:userId            | —        | Get public profile                 |
| PUT    | /api/profile/                   | JWT      | Update base profile                |
| PUT    | /api/profile/freelancer         | JWT      | Update freelancer profile          |
| PUT    | /api/profile/client             | JWT      | Update client profile              |
| POST   | /api/profile/photo              | JWT      | Upload profile photo (Cloudinary)  |
| POST   | /api/profile/portfolio          | JWT      | Add portfolio item                 |
| PUT    | /api/profile/portfolio/:itemId  | JWT      | Update portfolio item              |
| DELETE | /api/profile/portfolio/:itemId  | JWT      | Delete portfolio item              |
| GET    | /api/users/                     | Admin    | List all users with filters        |
| GET    | /api/users/:userId              | Admin    | Get user by ID                     |
| PATCH  | /api/users/:userId/suspend      | Admin    | Suspend / unsuspend user           |
| DELETE | /api/users/:userId              | Admin    | Delete user                        |

---

## Frontend pages

| Route                      | Component            | Access  | Description                     |
|----------------------------|----------------------|---------|---------------------------------|
| /register                  | RegisterPage         | Guest   | Role selector + signup form     |
| /login                     | LoginPage            | Guest   | Login with role tab switcher    |
| /login?as=freelancer       | LoginPage            | Guest   | Opens with freelancer panel     |
| /login?as=admin            | LoginPage            | Guest   | Opens with admin panel          |
| /admin/login               | AdminLoginPage       | Guest   | Dark hardened admin login       |
| /verify-email/:token       | VerifyEmailPage      | Public  | Confirms email from link        |
| /forgot-password           | ForgotPasswordPage   | Guest   | Request reset link              |
| /reset-password/:token     | ResetPasswordPage    | Guest   | Set new password                |
| /dashboard                 | Dashboard (stub)     | Any auth| User dashboard (Module 2)       |
| /admin                     | AdminDashboard(stub) | Admin   | Admin panel (Module 2)          |

---

## Quick start

### Backend
```bash
cd backend
cp .env.example .env       # Fill in MONGO_URI, JWT_SECRET, SMTP_* etc.
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Security highlights
- Passwords hashed with bcrypt (12 rounds)
- Access token: 7d JWT · Refresh token: 30d JWT (rotated on use)
- Max 5 refresh tokens stored per user (multi-device)
- All sessions invalidated on password change/reset
- Rate limiting: 10 auth attempts / 15 min
- Helmet + CORS configured
- Email enumeration protection on forgot-password
- Role-based access control on every protected route
- Multer limits: 5 MB, JPEG/PNG/WebP only
=======
# Freelance-marketplace
>>>>>>> c7a11650f7cb7dd6a1e0838caa1b416630172619
