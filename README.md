# E-commerce Shopfront

A modern, responsive e-commerce frontend built with **React**, **TypeScript**, and **Vite**, styled with **Tailwind CSS** and **Shadcn UI**.

## 🚀 Features

-   **Authentication**: Secure user login and registration.
-   **Product Browsing**: Advanced search, filtering, and categorization.
-   **Shopping Cart**: Real-time cart management.
-   **Checkout**: Seamless order placement and address management.
-   **Responsive Design**: Mobile-first approach ensuring a great experience on all devices.
-   **Dark Mode**: Sleek dark mode support.

## 🛠️ Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **State Management/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest)
-   **Routing**: [React Router](https://reactrouter.com/)
-   **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## 📦 Deployment on Vercel

This project is optimized for deployment on [Vercel](https://vercel.com/).

### Prerequisites

1.  A Vercel account.
2.  The backend API URL (deployed separately, e.g., on Render).

### Steps

1.  **Push to GitHub**: Ensure your code is pushed to a GitHub repository.
2.  **Import to Vercel**:
    -   Go to your Vercel dashboard.
    -   Click "Add New..." > "Project".
    -   Import your GitHub repository.
3.  **Configure Project**:
    -   Framework Preset: **Vite**
    -   Root Directory: `./` (default)
4.  **Environment Variables**:
    -   Add the following environment variable:
        -   `VITE_API_BASE_URL`: Your backend API URL (e.g., `https://ecommerce-backend-i9yg.onrender.com`)
5.  **Deploy**: Click "Deploy".

Vercel will build and deploy your application. You'll get a production URL (e.g., `https://your-project.vercel.app`).

## 🏃‍♂️ Local Development

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure Environment**:
    -   Create a `.env.local` file in the root directory.
    -   Add your API URL:
        ```env
        VITE_API_BASE_URL=https://ecommerce-backend-i9yg.onrender.com
        ```

4.  **Run the dev server**:
    ```bash
    npm run dev
    ```

## 🏗️ Build for Production

To create a production build locally:

```bash
npm run build
```

The output will be in the `dist` directory.

## 📂 Project Structure

```
src/
├── components/   # Reusable UI components
├── config/       # App configuration
├── context/      # React Contexts
├── hooks/        # Custom React hooks
├── lib/          # Utilities and libraries
├── pages/        # Page components (Routes)
├── types/        # TypeScript interfaces
└── utils/        # Helper functions
```