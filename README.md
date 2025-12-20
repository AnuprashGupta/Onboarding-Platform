# Onboarding Platform - React Native Assignment

A production-ready mobile onboarding platform with reusable components, form validation, smooth animations, and Cloudflare Workers backend.

**🔗 Live Backend**: https://onboarding-platform-api.anuprash1850531003.workers.dev

---

## 📱 Deliverables

- **APK Download**: [Google Drive Link](#) _(Update with actual link)_
- **Repository**: https://github.com/AnuprashGupta/Onboarding-Platform.git
- **Backend**: Cloudflare Workers (deployed and working)

---

## 🛠️ Tech Stack

| Category | Technology | Version | Why? |
|----------|-----------|---------|------|
| Framework | React Native | 0.81.5 | Required, cross-platform |
| Runtime | Expo | ~54.0.30 | Fast development, managed workflow |
| Language | TypeScript | ~5.9.2 | Type safety, fewer bugs |
| Animation | React Native Reanimated | ~4.1.1 | 60fps UI thread animations |
| HTTP | Axios | ^1.13.2 | Interceptors, error handling |
| Calendar | react-native-calendars | ^1.1313.0 | Rich UI, date validation |
| Files | expo-document-picker | ^14.0.8 | Native file selection |
| Backend | Cloudflare Workers + KV | Latest | Serverless, global edge |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│   Mobile App (React Native)        │
│   ├─ Components (CounterTimer,     │
│   │  TextInput, CalendarPicker,    │
│   │  FilePicker)                   │
│   ├─ Business Logic (Services)     │
│   └─ API Client (Axios)            │
└─────────────────────────────────────┘
              ↕ HTTPS/REST
┌─────────────────────────────────────┐
│   Cloudflare Workers + KV           │
│   ├─ POST /api/onboard              │
│   ├─ GET /api/onboard/:id           │
│   └─ GET /health                    │
└─────────────────────────────────────┘
```

---

## 🌐 Backend Choice

**Selected**: Cloudflare Workers + KV (Option A)

**Why?**
- ✅ Serverless (no server management, auto-scaling)
- ✅ Global edge network (low latency worldwide)
- ✅ Free tier (100,000 requests/day)
- ✅ Fast deployment (single command)
- ✅ KV storage (globally replicated)

**Live URL**: https://onboarding-platform-api.anuprash1850531003.workers.dev

---

## 📡 API Contract

### **Endpoints**

**1. Health Check**
```bash
GET /health
# Response: {"status": "ok", "service": "Onboarding Platform API"}
```

**2. Submit Onboarding**
```bash
POST /api/onboard
Content-Type: application/json
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "startDate": "25/12/2025",
  "documents": [
    {
      "name": "resume.pdf",
      "size": 125000,
      "mimeType": "application/pdf",
      "uri": "file://..."
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "onboard_1766165690347_qahuk9i8av",
    "name": "John Doe",
    "email": "john@example.com",
    "startDate": "25/12/2025",
    "documents": [...],
    "createdAt": "2025-12-19T10:30:00.000Z"
  },
  "message": "Onboarding submitted successfully"
}
```

**3. Get by ID**
```bash
GET /api/onboard/:id
```

---

## 🚀 Setup & Run

### **Quick Start**

```bash
# 1. Clone & install
git clone https://github.com/AnuprashGupta/Onboarding-Platform.git
cd onboarding-platform
npm install

# 2. Create .env (optional - works without it using mock backend)
# See Environment Variables section below

# 3. Run
npm start        # Start Metro
npm run android  # Run on Android
npm run ios      # Run on iOS (macOS only)
```

### **Environment Variables**

Create `.env` in project root (optional):


```

**⚠️ Important**: 
- I have NOT committed `.env` to git (already in `.gitignore`)
- App works without `.env` using mock backend
- Use placeholders for any secrets

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `EXPO_PUBLIC_API_URL` | No | Mock backend | Backend API base URL |
| `EXPO_PUBLIC_ENVIRONMENT` | No | development | Environment name |

---

## 📱 Building APK

### **Method 1: Local Build (Tested & Working)**

This method builds the APK directly on your machine using Gradle.

**Step 1: Generate Native Android Code**
```bash
npx expo prebuild --platform android
```

**Step 2: Build Release APK**

**On Windows:**
```bash
cd android
.\gradlew.bat assembleRelease
```

**On Mac/Linux:**
```bash
cd android
./gradlew assembleRelease
```

**Step 3: Find Your APK**
```
📁 Location: android/app/build/outputs/apk/release/app-release.apk
📦 Size: ~85 MB
```

**Step 4: Test the APK**
```bash
# Install on connected device/emulator
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag-and-drop the APK onto your emulator
```

**Step 5: Upload to Google Drive**
1. Open Google Drive
2. Create folder: "Onboarding-Platform-Assignment"
3. Upload `app-release.apk`
4. Upload `README.md`
5. Set sharing: "Anyone with link can view"
6. Copy the link for submission

---

### **Method 2: EAS Build (Cloud Alternative)**

This builds the APK in the cloud (takes ~15 minutes).

```bash
# 1. Install & login
npm install -g eas-cli
eas login

# 2. Configure project (first time only)
eas build:configure
# Answer "y" to create EAS project

# 3. Build APK
eas build --platform android --profile preview

# 4. Wait for build to complete (~15 minutes)
# You'll receive a download link via email and CLI

# 5. Download APK and upload to Google Drive
```

**Tip**: Use Method 1 (Local Build) if you want the APK immediately!

---

## 📊 Data Model

### **Onboarding Payload**

```typescript
interface OnboardingSubmitRequest {
  name: string;              // 2-100 characters
  email: string;             // Valid email format
  startDate: string;         // DD/MM/YYYY format
  documents: DocumentFile[]; // 1-3 files, max 5MB each
}

interface DocumentFile {
  name: string;      // File name
  size: number;      // Size in bytes
  mimeType?: string; // MIME type
  uri: string;       // Local file URI
  base64?: string;   // Base64 content (optional)
}
```

**Example JSON:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "startDate": "25/12/2025",
  "documents": [
    {
      "name": "photo.jpg",
      "size": 125000,
      "mimeType": "image/jpeg",
      "uri": "file:///path/to/photo.jpg",
      "base64": "iVBORw0KGg..."
    }
  ]
}
```

---

## 📦 Third-Party Libraries

| Library | Why Used | Alternative |
|---------|----------|-------------|
| **expo** | Faster development, managed workflow | Bare RN (complex) |
| **typescript** | Type safety, better DX | JavaScript |
| **react-native-reanimated** | 60fps UI thread animations | Animated API |
| **axios** | Interceptors, better error handling | fetch |
| **react-native-calendars** | Rich calendar UI | DateTimePicker |
| **expo-document-picker** | Easy cross-platform file picker | react-native-document-picker |
| **expo-file-system** | File operations, base64 conversion | Native modules |
| **@expo/vector-icons** | Professional icon library | Custom SVGs |

**Key Decisions:**
- **Reanimated** for smooth 60fps animations (runs on UI thread)
- **Axios** for centralized error handling and interceptors
- **TypeScript** for catching errors at compile time
- **Expo** for faster development and easier deployment

---

## 🧪 Testing

### **Testing Strategy**
- ✅ Manual testing (comprehensive)
- 📋 Automated testing (future improvement)

### **Tested:**
- ✅ All 4 components (CounterTimer, TextInput, CalendarPicker, FilePicker)
- ✅ Complete onboarding workflow
- ✅ Form validation (client + server)
- ✅ Backend API (all endpoints)
- ✅ KV storage (data persistence confirmed)
- ✅ Error handling
- ✅ Android emulator (API 28)

### **Known Bugs**
**None identified in core functionality.**

Minor issues:
1. Calendar keyboard may need double-tap (library limitation)
2. File picker on web uses browser API (limited features)
3. Large files (>5MB) may timeout (by design)

### **Future Improvements**

**High Priority:**
- Unit tests (Jest + React Testing Library)
- E2E tests (Detox)
- Offline support (AsyncStorage + sync queue)
- File storage (Cloudflare R2 instead of base64)
- Authentication (JWT tokens)

**Medium Priority:**
- Form draft saving
- Image compression
- Camera integration
- Multi-step wizard UI

**Low Priority:**
- Dark mode
- Localization (i18n)
- Analytics tracking
- Error monitoring (Sentry)

---

## 🚧 Known Limitations

| Limitation | Current | Production Solution |
|------------|---------|---------------------|
| **File Storage** | Base64 in KV | Use Cloudflare R2 or S3 |
| **State Management** | Local state | Zustand/Redux for large apps |
| **Offline** | Mock backend only | AsyncStorage + sync queue |
| **Auth** | Session ID only | JWT + OAuth |
| **Consistency** | Eventually consistent KV | Use D1 for strong consistency |

**Trade-offs Made:**
- Expo over bare RN: Faster dev, slightly larger bundle
- Base64 files: Simple for demo, not production-ready
- Local state: Sufficient for this app size
- Mock backend: Enables offline development

---

## 🎯 Features Implemented

### ✅ **4 Reusable Components**

1. **CounterTimer** - Smooth 60fps animation, Start/Stop/Reset/Restart
2. **TextInput** - Validation (required, email, length, regex, custom)
3. **CalendarPicker** - Manual entry + calendar modal, date validation
4. **FilePicker** - Multi-file, size/type validation, remove files

### ✅ **Complete Workflow**
- Form with all 4 components
- Multi-layer validation
- Loading states
- Success screen with data
- Error handling

### ✅ **Backend Integration**
- Cloudflare Workers deployed
- KV storage working
- Real-time logs (`wrangler tail`)
- Email indexing for lookup

---

## 📁 Project Structure

```
onboarding-platform/
├── app/(tabs)/index.tsx           # Main screen
├── components/onboarding/         # 4 reusable components
│   ├── CounterTimer.tsx
│   ├── TextInput.tsx
│   ├── CalendarPicker.tsx
│   └── FilePicker.tsx
├── services/onboarding.service.ts # Business logic
├── utils/api.ts                   # HTTP client
├── types/onboarding.ts            # TypeScript types
├── backend/
│   ├── worker.js                  # Cloudflare Worker (280 lines)
│   └── wrangler.toml              # Configuration
├── .env                           # Environment vars (create this)
├── eas.json                       # Build config
└── package.json
```

---

## 🔧 Backend Deployment (Optional)

Backend is already deployed. To deploy your own:

```bash
# 1. Install & login
npm install -g wrangler
wrangler login

# 2. Create KV namespace
cd backend
wrangler kv namespace create ONBOARDING_DATA
# Copy the namespace ID

# 3. Update wrangler.toml with your namespace ID

# 4. Deploy
wrangler deploy

# 5. Update .env with your worker URL
```

**View Backend Code**: See `backend/worker.js`

**Live Logs**: `wrangler tail` (shows real-time requests)

**Dashboard**: [View KV Data](https://dash.cloudflare.com/2e174b5747546d90c647965a4ed1e876/workers/kv/namespaces/6b1ee05bef3b47d097f92633f4a2f438)

---

## ✅ Assignment Checklist

- [x] CounterTimer with smooth animations
- [x] TextInput with validation
- [x] CalendarPicker component
- [x] FilePicker component
- [x] Complete onboarding workflow
- [x] Backend (Cloudflare Workers + KV)
- [x] Form validation (multi-layer)
- [x] Error handling
- [x] TypeScript (100% coverage)
- [x] API documentation
- [x] Build configuration
- [x] Architecture diagram
- [x] Comprehensive README
- [ ] APK uploaded to Drive _(Action required)_
- [ ] Repository on GitHub _(Action required)_

---

## 📞 Support

**Documentation:**
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)

**Backend:**
- Workers: https://dash.cloudflare.com/workers
- KV Storage: https://dash.cloudflare.com/workers/kv

---

## 👤 Author

**Your Name**
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

---

**Built with React Native • Expo • TypeScript • Cloudflare Workers**

**Version**: 1.0.0 | **Date**: December 2025

---

## 📝 Quick Commands

```bash
# Development
npm start              # Start Metro
npm run android        # Run on Android
npm run ios            # Run on iOS

# Build
eas build --platform android --profile preview

# Backend
cd backend
wrangler tail          # View logs
wrangler deploy        # Deploy worker
```
