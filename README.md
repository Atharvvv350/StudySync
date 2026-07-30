# StudySync

StudySync is a comprehensive educational platform designed to enhance student learning through study materials, adaptive quizzes, discussion forums, and gamification. It connects students and teachers, enabling a collaborative environment where teachers can upload resources and create assessments, while students can access materials, test their knowledge, and track their progress through detailed analytics and leaderboards.

## 🚀 Live Demo

Check out the deployed application: **[https://mystudysync.vercel.app](https://mystudysync.vercel.app)**

## ✨ Features

-   **Authentication & Authorization**: Secure registration and login with role-based access control (Student, Teacher, Admin).
-   **Profile Management**: Personalized profiles with gamification elements like XP, Badges, and Ranks.
-   **Study Material Repository**: Teachers can upload PDF materials; Students can browse and filter by subject/topic.
-   **Adaptive Quizzes**: Interactive quizzes with automatic scoring and difficulty levels.
-   **Discussion Forum**: A community space for asking questions, upvoting answers, and getting teacher verification.
-   **Analytics & Leaderboard**: Visual dashboards for tracking performance and a global leaderboard to foster healthy competition.

## 🛠️ Tech Stack

### Frontend
-   **Framework**: React (Vite)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS, Shadcn UI
-   **State Management & Data Fetching**: React Query (@tanstack/react-query)
-   **Forms & Validation**: React Hook Form, Zod
-   **Routing**: React Router DOM
-   **Charts**: Recharts
-   **Icons**: Lucide React
-   **HTTP Client**: Axios
-   **Other Tools**: React PDF, React Quill, Sonner

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Language**: TypeScript
-   **Database**: MongoDB (with Mongoose)
-   **Authentication**: JWT, Bcryptjs
-   **File Storage**: Cloudinary (with Multer)
-   **Validation**: Zod
-   **Email**: Nodemailer
-   **Scheduling**: Node Cron
-   **Security**: Helmet, CORS

## 🏃‍♂️ Running Locally

### Prerequisites
-   Node.js installed
-   MongoDB URI
-   Cloudinary Credentials

### Steps

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Sahil390/StudySync.git
    cd StudySync
    ```

2.  **Setup Backend**
    ```bash
    cd backend
    npm install
    # Create a .env file with your credentials (PORT, MONGO_URI, JWT_SECRET, CLOUDINARY_*, etc.)
    npm run dev
    ```

3.  **Setup Frontend**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
