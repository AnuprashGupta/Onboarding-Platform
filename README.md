# Onboarding Platform - React Native Assignment

A production-ready mobile onboarding platform built with React Native and Expo, featuring reusable components, form validation, document upload, and backend integration.

## 📱 Demo & Deliverables

- **APK Download**: [Google Drive Link](https://drive.google.com/your-link-here)
- **Source Code**: This repository
- **Demo Video**: [Optional - 30-90s walkthrough]

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Mobile App (React Native)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Presentation Layer (Components & Screens)            │  │
│  │  - CounterTimer    - CalendarPicker                   │  │
│  │  - TextInput       - FilePicker                       │  │
│  │  - OnboardingScreen                                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                 │  │
│  │  - Validation Logic                                   │  │
│  │  - State Management                                   │  │
│  │  - Form Handling                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services Layer                                       │  │
│  │  - OnboardingService                                  │  │
│  │  - API Client (Axios)                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            Backend (Cloudflare Workers)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Endpoints                                        │  │
│  │  POST /api/onboard    - Submit onboarding            │  │
│  │  GET  /api/onboard/:id - Get submission              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Data Storage (Cloudflare KV)                        │  │
│  │  - Onboarding Data                                    │  │
│  │  - File Metadata                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Features Implemented

### ✅ Must-Have Features

1. **CounterTimer Component** (Fully Reusable)
   - Smooth animation from 0 to target number over specified duration
   - Uses React Native Reanimated for 60fps performance
   - Controls: Start, Stop, Reset, Restart
   - Configurable easing (linear, easeInOut, easeOut)
   - Visual state indicators (idle/running/paused/completed)
   - Robust error handling for edge cases

2. **TextInput Component** (Fully Reusable)
   - Configurable validation rules (required, minLength, maxLength, regex, email, custom)
   - Real-time validation with error messages
   - Success/error visual indicators
   - Helper text and character counter
   - Accessibility labels and hints
   - Controlled and uncontrolled modes supported

3. **CalendarPicker Component** (Fully Reusable)
   - Composite: text input + calendar modal
   - Manual text entry and visual calendar selection
   - Configurable date format (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
   - Min/max date constraints
   - Date validation and error messages
   - Clear functionality

4. **FilePicker Component** (Fully Reusable)
   - Multiple file selection (configurable max count)
   - File type restrictions (mime types and extensions)
   - Size limits (per file and total)
   - File list with name, size, and type display
   - Remove individual files or clear all
   - Comprehensive validation with user-friendly errors

5. **Onboarding Workflow**
   - Collect name and email with validation
   - Select start date with calendar
   - Upload 1-3 documents
   - Form-wide validation before submission
   - Loading states and disabled states
   - Success screen with submission details

6. **Backend Integration**
   - Cloudflare Workers REST API
   - Cloudflare KV for data persistence
   - Ephemeral session ID for tracking
   - Mock mode for offline development
   - Error handling and retry logic
   - CORS enabled

## 🛠️ Tech Stack

| Category | Technology | Version | Why? |
|----------|-----------|---------|------|
| Framework | React Native | 0.81.5 | Mandatory, cross-platform mobile dev |
| Runtime | Expo | ~54.0 | Rapid development, managed workflow |
| Language | TypeScript | ~5.9.2 | Type safety, better DX |
| Animation | React Native Reanimated | ~4.1.1 | Smooth 60fps animations |
| HTTP Client | Axios | latest | Robust HTTP with interceptors |
| Calendar | react-native-calendars | latest | Rich calendar UI |
| File Picker | expo-document-picker | latest | Native file selection |
| Backend | Cloudflare Workers | - | Serverless, global edge network |
| Storage | Cloudflare KV | - | Fast key-value store |
| State | React Hooks + Context | - | Built-in, no extra deps needed |

## 📁 Project Structure

```
onboarding-platform/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   └── index.tsx             # Main onboarding screen
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable components
│   └── onboarding/               # Onboarding-specific components
│       ├── CounterTimer.tsx      # Counter timer with animations
│       ├── TextInput.tsx         # Validated text input
│       ├── CalendarPicker.tsx    # Date picker component
│       └── FilePicker.tsx        # File selection component
├── services/                     # Business logic layer
│   └── onboarding.service.ts     # Onboarding API service
├── utils/                        # Utility functions
│   └── api.ts                    # HTTP client wrapper
├── types/                        # TypeScript type definitions
│   └── onboarding.ts             # Onboarding data types
├── backend/                      # Backend code
│   ├── worker.js                 # Cloudflare Worker
│   └── wrangler.toml             # Worker configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── app.json                      # Expo configuration
└── README.md                     # This file
```

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+ and npm/yarn
- Android Studio (for Android development) or Xcode (for iOS)
- Expo CLI: `npm install -g expo-cli`
- Android device or emulator

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd onboarding-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - The app uses a mock backend by default for easy testing
   - To connect to real backend, create `.env` file:
   ```env
   EXPO_PUBLIC_API_URL=https://your-worker-name.workers.dev
   EXPO_PUBLIC_ENVIRONMENT=development
   ```

4. **Start development server**
   ```bash
   npm start
   # or
   npm run android  # For Android
   npm run ios      # For iOS (macOS only)
   npm run web      # For web
   ```

## 📱 Building APK

### Method 1: EAS Build (Recommended)

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Configure build**
   ```bash
   eas build:configure
   ```

4. **Build APK**
   ```bash
   eas build --platform android --profile preview
   ```

5. **Download APK**
   - Check build status: `eas build:list`
   - Download APK from provided URL
   - Upload to Google Drive

### Method 2: Local Build

1. **Generate Android build**
   ```bash
   expo prebuild
   cd android
   ./gradlew assembleRelease
   ```

2. **APK location**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

## 🌐 Backend Setup (Cloudflare Workers)

### Option A: Use Mock Backend (Default)
The app works out of the box with a mock backend. No setup required!

### Option B: Deploy Real Backend

1. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Create KV namespace**
   ```bash
   wrangler kv:namespace create "ONBOARDING_DATA"
   ```

4. **Update wrangler.toml**
   - Copy the namespace ID from step 3
   - Update `backend/wrangler.toml` with your namespace ID

5. **Deploy worker**
   ```bash
   cd backend
   wrangler deploy
   ```

6. **Update app configuration**
   - Copy your worker URL
   - Update `EXPO_PUBLIC_API_URL` in `.env`
   - Change `mockSubmitOnboarding` to `submitOnboarding` in `app/(tabs)/index.tsx` line 67

### API Contract

#### POST /api/onboard
Submit onboarding data

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "startDate": "25/12/2024",
  "documents": [
    {
      "name": "avatar.jpg",
      "size": 125000,
      "mimeType": "image/jpeg",
      "uri": "file://...",
      "base64": "..."
    }
  ],
  "submittedAt": "2024-12-18T10:30:00.000Z"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": "onboard_1702898400000_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "startDate": "25/12/2024",
    "documents": [...],
    "createdAt": "2024-12-18T10:30:00.000Z",
    "updatedAt": "2024-12-18T10:30:00.000Z"
  },
  "message": "Onboarding submitted successfully"
}
```

#### GET /api/onboard/:id
Retrieve onboarding data

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "onboard_1702898400000_abc123",
    ...
  }
}
```

## 🧪 Testing

### Manual Testing Checklist

- [ ] CounterTimer starts, stops, resets, and restarts correctly
- [ ] CounterTimer handles invalid inputs gracefully
- [ ] TextInput validates required fields
- [ ] TextInput shows character count for maxLength
- [ ] CalendarPicker accepts manual date entry
- [ ] CalendarPicker validates date format and constraints
- [ ] FilePicker enforces file count limits
- [ ] FilePicker validates file size and types
- [ ] Form submission validates all fields
- [ ] Form shows loading state during submission
- [ ] Success screen displays correct data
- [ ] App works offline with mock backend
- [ ] Accessibility labels work with screen readers

### Running the App

1. **Start Metro bundler**
```bash
   npm start
   ```

2. **Run on device/emulator**
   - Scan QR code with Expo Go (for development)
   - Or use `npm run android` for emulator

3. **Test workflow**
   - Enter name (min 2 chars)
   - Enter valid email
   - Select future start date
   - Upload 1-3 files
   - Submit form
   - Verify success screen

## 🎨 Design Decisions & Tradeoffs

### Component Architecture
- **Decision**: Separate reusable components in `components/onboarding/`
- **Why**: Modularity, testability, reusability across screens
- **Tradeoff**: More files, but better organization

### State Management
- **Decision**: React Hooks + local state
- **Why**: Simple, built-in, no external deps needed
- **Tradeoff**: Could use Zustand/Redux for larger apps
- **Future**: Add Context API if state needs to be shared

### Animation Library
- **Decision**: React Native Reanimated
- **Why**: Runs on UI thread, 60fps smooth animations
- **Tradeoff**: Larger bundle size vs plain Animated API
- **Benefit**: Professional, production-quality animations

### Backend Choice
- **Decision**: Cloudflare Workers + KV
- **Why**: Serverless, global edge network, free tier, easy deploy
- **Tradeoff**: KV is eventually consistent (not strongly consistent)
- **Alternative**: Could use Supabase/Firebase for real-time features

### File Handling
- **Decision**: Base64 encoding for small files
- **Why**: Simple, works with KV storage
- **Tradeoff**: Not suitable for large files (use R2/S3 in production)
- **Limit**: 5MB per file, 15MB total

### Validation Strategy
- **Decision**: Client-side validation first, server-side second
- **Why**: Better UX, immediate feedback
- **Tradeoff**: Duplicate validation logic
- **Benefit**: Progressive enhancement, works offline

## 🐛 Known Limitations & Future Improvements

### Current Limitations
1. Files stored as base64 (not scalable for large files)
   - **Future**: Use Cloudflare R2 or AWS S3 for file storage
2. No authentication/authorization
   - **Future**: Add JWT tokens or OAuth integration
3. No offline persistence
   - **Future**: Add AsyncStorage for form draft saving
4. Limited error recovery
   - **Future**: Add automatic retry with exponential backoff
5. Calendar picker doesn't support time
   - **Future**: Add time picker component if needed

### Potential Enhancements
- [ ] Add photo capture from camera
- [ ] Add signature capture component
- [ ] Add multi-step wizard UI
- [ ] Add form progress indicator
- [ ] Add email verification
- [ ] Add push notifications for status updates
- [ ] Add analytics tracking
- [ ] Add unit tests with Jest
- [ ] Add E2E tests with Detox
- [ ] Add CI/CD pipeline

## 📦 Dependencies

### Production Dependencies
```json
{
  "expo": "~54.0.30",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "react-native-reanimated": "~4.1.1",
  "expo-document-picker": "latest",
  "react-native-calendars": "latest",
  "axios": "latest"
}
```

### Why These Libraries?
- **expo-document-picker**: Native file picker, easy API
- **react-native-calendars**: Rich calendar UI, customizable
- **axios**: Battle-tested HTTP client, interceptors
- **react-native-reanimated**: Best animation performance

## 🔒 Security Considerations

1. **API Keys**: No hardcoded secrets (use environment variables)
2. **Input Validation**: Both client and server-side
3. **File Validation**: Type and size restrictions
4. **CORS**: Configured in backend for security
5. **Session ID**: Ephemeral, not for authentication
6. **Data Privacy**: No sensitive data logged

## 📄 License

This is an assignment project for demonstration purposes.

## 👤 Contact

For questions or issues, please contact [your-email@example.com]

---

## 🎯 Assignment Completion Checklist

- [x] CounterTimer component with smooth animations
- [x] TextInput component with validation
- [x] CalendarPicker component
- [x] FilePicker component
- [x] Onboarding workflow screen
- [x] Backend integration (Cloudflare Workers)
- [x] Form validation
- [x] Error handling
- [x] Loading states
- [x] Success screen
- [x] TypeScript types
- [x] Accessibility basics
- [x] Clean architecture
- [x] Comprehensive README
- [x] Backend code provided
- [x] Build instructions
- [ ] APK uploaded to Google Drive
- [ ] Demo video (optional)

**Time Invested**: ~2-3 days as specified

**Submission Date**: [Your submission date]

**Drive Link**: [Your Google Drive link with APK and README]

**Repository**: [Your Git repository URL]
