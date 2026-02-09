# MOU Draft Services

A web application for generating Memorandum of Understanding (MOU) drafts with PDF and DOCX export capabilities. Built with React (Vite) frontend and Node.js/Express backend, with Google Sheets integration for data storage.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

---

## ✨ Features

- Generate MOU drafts with customizable party details
- Export to PDF and DOCX formats
- Google Sheets integration for user data storage
- Modern, responsive UI
- Vercel-ready deployment

---

## 🛠️ Tech Stack

| Layer    | Technology                     |
| -------- | ------------------------------ |
| Frontend | React 18, Vite                 |
| Backend  | Node.js, Express               |
| Storage  | Google Sheets API              |
| Hosting  | Vercel (serverless functions)  |

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.0.0 or higher)
- **npm** (comes with Node.js)
- **Git** (optional, for cloning)

Check your versions:
```bash
node --version   # Should be >= 20.0.0
npm --version
```

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd Free-MouDraftServices-main
```

Or download and extract the ZIP file.

### Step 2: Install All Dependencies

Run this single command to install dependencies for both the root project and the client:

```bash
npm run install:all
```

This will:
- Install root dependencies (Express, dotenv, cors, etc.)
- Install client dependencies (React, Vite, etc.)

---

## ⚙️ Configuration

### Step 1: Set Up Google Cloud (Required for Backend)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new Project (or select an existing one)
3. Navigate to **APIs & Services > Library**
4. Search for **"Google Sheets API"** and click **Enable**
5. Navigate to **APIs & Services > Credentials**
6. Click **Create Credentials** → **Service Account**
7. Fill in a name (e.g., `mou-writer`) and click **Create and Continue**
8. Skip role assignment, click **Done**
9. Click on the newly created Service Account email
10. Go to **Keys** tab → **Add Key** → **Create new key** → **JSON**
11. Download the JSON file and copy the `client_email` and `private_key` values

### Step 2: Set Up Google Sheet

1. Create a new Google Sheet at [sheets.google.com](https://sheets.google.com)
2. Name it **"MOU Draft Users"**
3. Add headers in the first row: `Date`, `Name`, `Phone`, `Email`, `Role`
4. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
5. **Share the Sheet**: Click "Share" and invite the Service Account Email as an **Editor**

### Step 3: Create Environment Variables

Create a `.env` file in the **root directory** with the following:

```env
PORT=3000
SPREADSHEET_ID=your_spreadsheet_id_here
GOOGLE_CLIENT_EMAIL=your_service_account_email@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here...\n-----END PRIVATE KEY-----\n"
```

> **⚠️ Important Notes:**
> - Ensure the private key is enclosed in double quotes
> - Keep the `\n` characters for newlines (copied directly from the JSON file)
> - Never commit the `.env` file to version control

---

## ▶️ Running the Application

### Development Mode

Start both the frontend and backend with a single command:

```bash
npm run dev
```

This will:
- Start the **Node.js backend** on `http://localhost:3000`
- Start the **Vite dev server** on `http://localhost:5173`

Open your browser and navigate to: **http://localhost:5173**

### Available Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm run dev`         | Start both frontend and backend          |
| `npm run build`       | Build the client for production          |
| `npm run install:all` | Install all dependencies (root + client) |

---

## 📁 Project Structure

```
Free-MouDraftServices-main/
├── api/                    # Serverless API functions (for Vercel)
│   └── index.js
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── ...
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express server files
├── .env                    # Environment variables (create this)
├── .gitignore
├── package.json            # Root package.json
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## 🌐 Deployment

### Deploy to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel Dashboard:
   - `SPREADSHEET_ID`
   - `GOOGLE_CLIENT_EMAIL`
   - `GOOGLE_PRIVATE_KEY`

The project includes a `vercel.json` configuration file for automatic setup.

---

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
| ----- | -------- |
| `command not found: node` | Install Node.js from [nodejs.org](https://nodejs.org) |
| `ECONNREFUSED` on API calls | Ensure the backend is running (`npm run dev`) |
| Google Sheets write error | Verify the Service Account has Editor access to the sheet |
| `Port 3000 already in use` | Kill the process: `lsof -ti:3000 \| xargs kill` |

---

## 📄 License

ISC

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request
