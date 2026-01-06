# KyatFlow - Smart Finance OS for Myanmar SMEs

A comprehensive financial management application built for Myanmar small and medium enterprises (SMEs) to track income, expenses, manage parties (customers/suppliers), and analyze business performance.

## Features

- 💰 **Transaction Management**: Record income and expenses with categories and payment methods
- 📊 **Analytics Dashboard**: Visual insights into cash flow, profit & loss, and category breakdowns
- 👥 **Party Management**: Track customers and suppliers with receivables/payables
- 💱 **Currency Display**: Toggle between MMK and Lakhs (သိန်း) display
- 💾 **Data Persistence**: All data stored locally in browser (localStorage)
- 📤 **Data Export**: Export transactions and parties as JSON or CSV
- 🔒 **Error Handling**: Comprehensive error boundaries and user feedback
- ⚡ **Production Ready**: Optimized build configuration and code splitting

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Routing**: React Router v6

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Production Build

To create an optimized production build:

```sh
# Build for production
npm run build

# Preview production build locally
npm run preview
```

The production build will be in the `dist` directory, optimized with:
- Code splitting and lazy loading
- Minified JavaScript and CSS
- Tree shaking for smaller bundle size
- Optimized asset handling

## Deployment

### Vercel (Recommended)

The app is optimized for Vercel deployment:

**Option 1: Deploy via Vercel CLI**
```sh
# Install Vercel CLI globally
npm i -g vercel

# Deploy to production
vercel --prod
```

**Option 2: Deploy via Vercel Dashboard**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel Dashboard](https://vercel.com/dashboard)
3. Vercel will auto-detect Vite configuration
4. Click "Deploy" - no configuration needed!

**Vercel Configuration:**
- Framework: Vite (auto-detected)
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

The `vercel.json` file is already configured with:
- ✅ SPA routing (all routes redirect to index.html)
- ✅ Optimized caching headers for assets
- ✅ Security headers (XSS protection, frame options, etc.)
- ✅ Long-term caching for static assets

**Other Hosting Options:**
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Use GitHub Actions or deploy manually
- **Any static host**: Upload the `dist` folder contents

## Data Storage

Currently, the app uses **localStorage** for data persistence. All transactions and parties are stored in the browser. To migrate to a backend API:

1. Update the API functions in `src/lib/api.ts`
2. Replace localStorage calls with HTTP requests
3. Configure API URL in environment variables

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=KyatFlow
```

## Project Structure

```
src/
├── components/     # React components
├── contexts/       # React contexts (Currency)
├── hooks/          # Custom hooks (useTransactions, useParties)
├── lib/            # Utilities, storage, API layer
├── pages/          # Page components
└── App.tsx         # Main app component
```

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
