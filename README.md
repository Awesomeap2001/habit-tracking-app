# Habit Tracker App 🔥

A beautiful and engaging habit tracking application built with React Native and Expo. Track your daily habits, build streaks, and stay motivated with a clean, minimalist UI.

## ✨ Features

### Core Functionality
- **Habit Management**: Create, edit, and delete habits with ease
- **Streak System**: Track your daily, weekly, and monthly streaks to stay motivated
- **Swipe Actions**: 
  - Swipe right to complete habits
  - Swipe left to delete habits
  - Visual feedback for completed habits
- **Frequency Tracking**: Support for daily, weekly, and monthly habits
- **Statistics Dashboard**: 
  - View total habits and completions
  - See your highest streak habit
  - Discover your most completed habit
  - Browse all habits sorted by streak

### User Experience
- **Clean & Minimalist UI**: Beautiful, modern interface with smooth animations
- **Real-time Updates**: Automatic data synchronization using TanStack Query
- **Smart Completion**: Prevents duplicate completions within the same period
- **Visual Feedback**: Clear indicators for completed habits and streak counts
- **Responsive Design**: Works seamlessly on iOS and Android

## 🛠️ Tech Stack

- **Framework**: React Native with Expo Router
- **State Management**: TanStack Query (React Query) for server state
- **Backend**: Appwrite for authentication and database
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **UI Components**: Custom components built with React Native primitives
- **Icons**: Material Community Icons
- **Navigation**: Expo Router (file-based routing)
- **Type Safety**: TypeScript

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- An Appwrite instance (for backend services)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Habit-tracking-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with your Appwrite credentials:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DB_ID=your_database_id
```

### 4. Start the development server

```bash
npx expo start
```

### 5. Run on your device

- **iOS**: Press `i` in the terminal or scan the QR code with Expo Go
- **Android**: Press `a` in the terminal or scan the QR code with Expo Go
- **Web**: Press `w` in the terminal

## 📱 App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Main habits list screen
│   ├── add-habit.tsx      # Create new habit
│   └── statistics.tsx    # Statistics dashboard
├── edit-habit.tsx         # Edit existing habit
├── auth.tsx              # Authentication screen
└── _layout.tsx            # Root layout

api/
└── habits.ts              # Habit API functions

components/
└── ui/                    # Reusable UI components

context/
└── auth-context.tsx       # Authentication context
```

## 🎯 Key Features Explained

### Streak System
The app calculates streaks based on habit frequency:
- **Daily**: Streak continues if completed within 24 hours
- **Weekly**: Streak continues if completed within the week
- **Monthly**: Streak continues if completed within the month

### Swipe Actions
- **Right Swipe**: Complete a habit (disabled if already completed today)
- **Left Swipe**: Delete a habit with confirmation

### Statistics
- **Total Habits**: Count of all your habits
- **Total Completions**: Sum of all habit completions
- **Highest Streak**: Habit with the longest current streak
- **Most Completed**: Habit with the most completion count
- **All Habits by Streak**: Sorted list of all habits by streak length

## 🔐 Authentication

The app uses Appwrite for user authentication. Users can:
- Sign up with email and password
- Sign in to their account
- Sign out securely

## 📊 Database Schema

### Habits Table
- `user_id`: User identifier
- `title`: Habit title
- `description`: Habit description
- `frequency`: daily, weekly, or monthly
- `streak_count`: Current streak count
- `last_completed`: Last completion timestamp

### Habit Completions Table
- `habit_id`: Reference to habit
- `user_id`: User identifier
- `completed_at`: Completion timestamp

## 🎨 UI/UX Highlights

- **Minimalist Design**: Clean interface with focus on content
- **Color-coded Cards**: Visual distinction for different habit types
- **Smooth Animations**: Gesture-based interactions with React Native Gesture Handler
- **Loading States**: Clear feedback during data fetching
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful prompts when no data is available

## 🧪 Development

### Available Scripts

```bash
npm start          # Start Expo development server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run on web
npm run lint       # Run ESLint
```

### Code Structure

- **API Layer**: All backend interactions in `api/habits.ts`
- **Components**: Reusable UI components in `components/ui/`
- **Context**: Global state management with React Context
- **Types**: TypeScript interfaces in `types/`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Backend powered by [Appwrite](https://appwrite.io)
- UI components inspired by modern design systems
- Icons from [Material Community Icons](https://github.com/Templarian/MaterialDesign)

---

**Built with ❤️ using React Native and Expo**
