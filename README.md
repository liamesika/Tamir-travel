# Tamir Trip - טיול עם תמיר

Premium trip booking website with full admin system, payment processing, and notification infrastructure.

## 🚀 Features

### User-Facing
- ✅ Beautiful Hebrew RTL landing page with 11 sections
- ✅ Trip booking system with real-time availability
- ✅ Stripe payment integration (deposit + remaining balance)
- ✅ Responsive design with premium animations
- ✅ Image gallery with lightbox
- ✅ Video showcases
- ✅ Customer reviews
- ✅ FAQ accordion
- ✅ Contact form

### Admin Panel
- ✅ Secure authentication system
- ✅ Booking management dashboard
- ✅ Multi-trip framework
- ✅ Content management system (CMS)
- ✅ Remaining balance payment tracking
- ✅ Email notification templates (Resend)
- ✅ WhatsApp message templates
- ✅ Real-time statistics

## 📦 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** Prisma ORM + SQLite (production ready for PostgreSQL)
- **Payments:** Stripe Checkout + Webhooks
- **Email:** Resend (templates ready)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Authentication:** Cookie-based sessions with bcrypt

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Steps

1. **Clone the repository**
   bash
   git clone <your-repo>
   cd tamir-trip
   

2. **Install dependencies**
   bash
   npm install
   

3. **Set up environment variables**
   bash
   cp .env.example .env
   

   Edit `.env` and fill in your values

4. **Set up database**
   bash
   npx prisma db push
   npx prisma db seed
   

5. **Run development server**
   bash
   npm run dev
   

   Open http://localhost:3000

## 🔐 Admin Access

- **URL:** http://localhost:3000/admin/login
- **Email:** admin@tamir-trip.com
- **Password:** admin123

**⚠️ Change these credentials in production!**

## 📁 Project Structure

tamir-trip/
├── app/                    # Next.js App Router
│   ├── admin/              # Admin panel
│   ├── api/                # API routes
│   └── booking/            # Booking flow
├── components/             # React components
├── lib/                    # Utilities
├── prisma/                 # Database
└── middleware.ts           # Route protection

## 🚢 Deployment

Set all environment variables and run:

bash
npm run build
npm start


## 👨‍💻 Developer

Built with ❤️ using Claude Code
