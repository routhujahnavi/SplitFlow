# SplitFlow 💸

SplitFlow is a premium, Apple-inspired financial application designed to make splitting expenses with friends and groups incredibly seamless. Built with a focus on high-end aesthetics, frictionless user experience, and robust data security.

🌍 **Live Demo:** [SplitFlow App](https://split-flow-wqlwniis3-rjsantoshi24-1155s-projects.vercel.app/auth)

---

## ✨ Features & Unique Highlights

- **Sleek, Premium UI:** Built with custom "glassmorphism" components, animated gradients, and ultra-smooth hover states that rival top-tier native applications.
- **Dynamic Dashboard:** A real-time Area Chart visualizing spending trends, automatically padding single-day entries to ensure beautiful curves.
- **Frictionless Authentication:** Simple "Sign In" and "Sign Up" flows, completely integrated with Google OAuth for one-click access.
- **Smart QR Profiles:** Every user is assigned a unique `split_id`. The Profile page dynamically generates a scannable QR Code so friends can add each other instantly in person.
- **Intelligent Group Management:** Create groups, add friends via their Split ID, and effortlessly divide expenses equally among participants.
- **Robust Security:** Powered by Supabase Row-Level Security (RLS) ensuring users can only read, update, or delete data directly tied to their own groups or friendships.
- **Localized Finance:** Fully localized to use Indian Rupees (₹) across the entire application with unified, hydration-safe date formatting.

---

## 🛠️ Tech Stack

**Frontend Framework:**
- [Next.js 14](https://nextjs.org/) (App Router)
- [React 18](https://react.dev/)

**Styling & UI:**
- [Tailwind CSS](https://tailwindcss.com/) (Custom configured for glassmorphism and ambient glows)
- [Lucide React](https://lucide.dev/) (Beautiful, consistent iconography)
- [Recharts](https://recharts.org/) (Responsive, animated financial data visualization)
- [qrcode.react](https://github.com/zpao/qrcode.react) (Client-side SVG QR code generation)

**Backend & Database:**
- [Supabase](https://supabase.com/) (PostgreSQL Database)
- Supabase Auth (Email & Google OAuth integration)
- `@supabase/ssr` (Secure server-side rendering auth helpers)

---

## 📁 Project Structure

```text
splitflow/
├── src/
│   ├── app/
│   │   ├── auth/           # Authentication pages & Google callback routes
│   │   ├── dashboard/      # Protected application routes (Groups, Friends, History)
│   │   └── actions.ts      # Next.js Server Actions (Database mutations)
│   ├── components/         # Reusable Client & Server components (Sidebar, Charts, Modals)
│   └── lib/
│       └── supabase/       # Supabase client configurations and Database Schema (schema.sql)
├── public/                 # Static assets
└── tailwind.config.ts      # Custom theme extensions and animations
```

---

## 🚀 Getting Started Locally

### 1. Clone the repository
```bash
git clone https://github.com/routhujahnavi/SplitFlow.git
cd splitflow
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set up Environment Variables
Create a `.env.local` file in the root directory and add your Supabase keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-anon-key
```
*(Note: Never place your `service_role` secret key in this file).*

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment Guide (Vercel)

1. Push your code to your GitHub repository.
2. Go to [Vercel](https://vercel.com/) and click **Import Project**.
3. Select your GitHub repository.
4. Under the **Environment Variables** section, add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Make absolutely sure there are no spaces or trailing slashes in your URL.
5. Click **Deploy**.
6. **Crucial Final Step:** Once Vercel gives you your live domain, go to your **Supabase Dashboard -> Authentication -> URL Configuration**, and add your live Vercel URL with `/auth/callback` to the Redirect Allow List.

---

*Designed and engineered with precision.*
