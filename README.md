# H4H-2025-NEXTJS: Gather Quality Context Quickly

A modern, feature-rich file management system built with Next.js, featuring Google Drive integration, real-time file upload capabilities, and an intuitive dashboard interface.

## ✨ Features

- **Google Drive Integration**: Seamlessly connect and manage your Google Drive files
- **Drag & Drop Upload**: Easy file uploading with progress tracking
- **Folder Management**: Create, organize, and navigate through folder structures
- **Dashboard Views**: Monitor and manage your files through an intuitive interface
- **OAuth2 Authentication**: Secure access to your files with Google authentication
- **Real-time Updates**: Instant feedback on file operations
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/your-username/H4H-2025-NEXTJS.git
cd H4H-2025-NEXTJS
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

4. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application running.

## 🛠️ Tech Stack

- **Framework**: Next.js with App Router
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **File Handling**: Custom file upload system
- **UI Components**: Shadcn
- **State Management**: React Context API
- **API Routes**: Next.js API routes with TypeScript

## 📁 Project Structure

```
├── app/
│   ├── api/           # API routes
│   ├── components/    # Reusable UI components
│   ├── drive/        # Google Drive integration
│   ├── home/         # Main application pages
|   ├── editor/         # Edit application pages
│   └── upload/       # File upload functionality
├── public/           # Static assets
└── utils/           # Helper functions
```

Built with ❤️ for H4H 2025