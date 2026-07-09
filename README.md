# 🌟 Aura — Women's Opportunity Platform

> **Phase 1** — Production-ready foundation for an AI-powered platform connecting women to scholarships, fellowships, internships, conferences, hackathons, and STEM programs worldwide.

![Aura Platform](https://img.shields.io/badge/Status-Phase%201%20Complete-blueviolet?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?style=for-the-badge&logo=firebase)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features (Phase 1)

| Module | Status |
|---|---|
| 🏠 Landing Page (Hero, Categories, Benefits, Testimonials) | ✅ Complete |
| 🔐 Authentication (Email, Google, Forgot Password) | ✅ Complete |
| 👤 User Profile (Education, Skills, Interests, Income) | ✅ Complete |
| 📊 Dashboard (Stats, Saved Opps, Deadline Reminders) | ✅ Complete |
| 🔍 Explore Opportunities (Search + Filters) | ✅ Complete |
| 📄 Opportunity Detail Page (Bookmark, Share, Set Reminder) | ✅ Complete |
| 🔖 Saved Opportunities Page | ✅ Complete |
| ⏰ Deadline Reminder System (Firestore-backed) | ✅ Complete |

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS v4
- **Auth + DB**: Firebase Authentication + Firestore
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/nikhilrawat2005/origin-v2v.git
cd origin-v2v
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Copy the environment template:

```bash
cp .env.local.example .env.local
```

Fill in your Firebase project credentials in `.env.local`. See [FIREBASE_SETUP_GUIDE.txt](FIREBASE_SETUP_GUIDE.txt) for detailed instructions.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout + AuthProvider
│   ├── globals.css           # Global styles + design tokens
│   ├── auth/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/page.tsx    # User dashboard
│   ├── explore/page.tsx      # Opportunity explorer + filters
│   ├── opportunity/[id]/page.tsx  # Opportunity detail
│   ├── profile/page.tsx      # User profile editor
│   └── saved/page.tsx        # Bookmarked opportunities
├── components/
│   ├── Navbar.tsx
│   └── Footer.tsx
├── context/
│   └── AuthContext.tsx       # Firebase auth + profile state
└── lib/
    ├── firebase.ts           # Firebase initialization
    ├── mockData.ts           # 15 sample opportunities
    └── schemas.ts            # Zod validation schemas
```

---

## 🔮 Phase 2 Roadmap

- 🤖 AI-powered opportunity matching based on profile
- 📬 Email/push notifications for deadlines
- 🗓️ Calendar integration
- 💰 Wallet / application tracker
- 📈 Confidence & progress tracker
- 🌐 Real-time opportunity database (Admin panel)

---

## 📋 Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Firebase credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

## 🤝 Contributing

This project is part of a hackathon submission. Pull requests and suggestions are welcome!

---

## 📜 License

MIT — Free to use, modify, and distribute.

---

<p align="center">Built with ❤️ for women in tech worldwide</p>
