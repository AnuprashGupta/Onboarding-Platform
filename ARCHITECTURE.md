# Architecture Documentation

## Overview

The Onboarding Platform follows a layered architecture pattern with clear separation of concerns.

## Architecture Layers

### 1. Presentation Layer (Components & Screens)

**Location**: `components/`, `app/`

**Responsibility**: UI rendering, user interaction, local state

```
┌─────────────────────────────────────┐
│     Presentation Layer              │
│  ┌─────────────────────────────┐   │
│  │  Screens                    │   │
│  │  - OnboardingScreen         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Reusable Components        │   │
│  │  - CounterTimer             │   │
│  │  - TextInput                │   │
│  │  - CalendarPicker           │   │
│  │  - FilePicker               │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Patterns**:
- **Component Composition**: Small, focused, reusable components
- **Props-based Configuration**: Flexible, declarative API
- **Controlled Components**: Parent controls state via props
- **Separation of Concerns**: UI logic separate from business logic

### 2. Business Logic Layer (Services)

**Location**: `services/`

**Responsibility**: Business rules, validation, data transformation

```
┌─────────────────────────────────────┐
│     Business Logic Layer            │
│  ┌─────────────────────────────┐   │
│  │  OnboardingService          │   │
│  │  - submitOnboarding()       │   │
│  │  - validateOnboardingData() │   │
│  │  - mockSubmitOnboarding()   │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Patterns**:
- **Service Layer Pattern**: Encapsulate business logic
- **Validation Logic**: Client-side validation before API calls
- **Mock/Stub Support**: Offline development capability

### 3. Infrastructure Layer (Utils & API)

**Location**: `utils/`, `types/`

**Responsibility**: HTTP communication, error handling, type definitions

```
┌─────────────────────────────────────┐
│     Infrastructure Layer            │
│  ┌─────────────────────────────┐   │
│  │  API Client                 │   │
│  │  - HTTP interceptors        │   │
│  │  - Error handling           │   │
│  │  - Session management       │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Type Definitions           │   │
│  │  - OnboardingData           │   │
│  │  - API contracts            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Patterns**:
- **Axios Interceptors**: Centralized request/response handling
- **Error Abstraction**: Convert HTTP errors to user-friendly messages
- **Type Safety**: TypeScript interfaces for all data structures

### 4. Backend Layer (Cloudflare Workers)

**Location**: `backend/`

**Responsibility**: API endpoints, data persistence, server-side validation

```
┌─────────────────────────────────────┐
│     Backend Layer                   │
│  ┌─────────────────────────────┐   │
│  │  Cloudflare Worker          │   │
│  │  - Route handlers           │   │
│  │  - CORS middleware          │   │
│  │  - Validation               │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │  Cloudflare KV Storage      │   │
│  │  - Onboarding data          │   │
│  │  - File metadata            │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Key Patterns**:
- **Serverless Architecture**: Auto-scaling, global edge network
- **RESTful API**: Standard HTTP methods and status codes
- **Key-Value Storage**: Fast, eventually consistent data store

## Data Flow

### Submission Flow

```
User Input
    ↓
TextInput/CalendarPicker/FilePicker (Validation)
    ↓
OnboardingScreen (Form State)
    ↓
OnboardingService.submitOnboarding() (Business Logic)
    ↓
apiClient.post() (HTTP Request)
    ↓
Cloudflare Worker (Server Validation)
    ↓
Cloudflare KV (Persistence)
    ↓
Response → Service → Screen → Success UI
```

### Component Data Flow

```
┌─────────────────────────────────────────────────┐
│                 OnboardingScreen                │
│                   (Parent State)                 │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  TextInput   │  │ FilePicker   │            │
│  │              │  │              │            │
│  │ value={name} │  │value={docs}  │            │
│  │onChange={fn} │  │onChange={fn} │            │
│  └──────────────┘  └──────────────┘            │
│         ↑                   ↑                    │
│         └───────────────────┘                    │
│              State Lifting                       │
└─────────────────────────────────────────────────┘
```

## Component Architecture

### CounterTimer

**Pattern**: Self-contained animated component

```
CounterTimer
├── Props: targetNumber, durationSec, onComplete, easing
├── State: state (idle/running/paused/completed)
├── Animation: Reanimated shared values + withTiming
└── Controls: Start/Stop/Reset/Restart buttons
```

**Animation Strategy**:
- Uses `useSharedValue` for animation state
- `withTiming` for smooth interpolation
- `cancelAnimation` for stop/reset
- Updates display value via interval (60fps)

### TextInput

**Pattern**: Controlled component with validation

```
TextInput
├── Props: value, onChangeText, validators, ...
├── State: errors, isFocused, isTouched
├── Validation: On blur and on change (after touched)
└── Visual: Border color based on validation state
```

**Validation Flow**:
1. User types → `onChangeText` called
2. If touched → validate → update errors
3. On blur → set touched → validate → show errors
4. Parent notified via `onValidate` callback

### CalendarPicker

**Pattern**: Composite component (Input + Modal)

```
CalendarPicker
├── Text Input: Manual date entry
├── Calendar Button: Opens modal
├── Calendar Modal: react-native-calendars
├── Validation: Format, min/max date
└── State: textValue, isModalVisible, error
```

**Interaction Flow**:
1. User can type date directly OR
2. Click calendar icon → modal opens
3. Select date → formatted → input updates
4. Validation runs on blur or selection

### FilePicker

**Pattern**: Document selection with validation

```
FilePicker
├── Select Button: Opens native picker
├── File List: Shows selected files
├── Validation: Type, size, count limits
└── State: files[], error
```

**File Handling**:
1. User clicks "Select Files"
2. Native picker opens (expo-document-picker)
3. Files validated (type, size, count)
4. Base64 conversion for upload
5. Display in scrollable list

## State Management

### Current Approach: Local State + Props

```typescript
// Parent component holds form state
const [name, setName] = useState('');
const [email, setEmail] = useState('');

// Pass to children via props
<TextInput value={name} onChangeText={setName} />
```

**Pros**:
- Simple, no external dependencies
- Easy to understand
- Sufficient for small forms

**Cons**:
- Prop drilling for deep hierarchies
- No global state sharing

### Future: Context API or State Library

For larger apps:

```typescript
// Context approach
const OnboardingContext = createContext();

// Or Zustand
const useOnboardingStore = create((set) => ({
  name: '',
  setName: (name) => set({ name }),
  // ...
}));
```

## Error Handling

### Layered Error Handling

1. **Component Level**: Input validation, UI errors
   ```typescript
   if (!value) setError('Required field');
   ```

2. **Service Level**: Business logic validation
   ```typescript
   const validation = validateOnboardingData(data);
   if (!validation.valid) return { success: false, errors };
   ```

3. **API Level**: Network errors, HTTP errors
   ```typescript
   try {
     await apiClient.post('/api/onboard', data);
   } catch (error) {
     // Convert to user-friendly message
   }
   ```

4. **Backend Level**: Server validation, storage errors
   ```javascript
   if (!data.email) {
     return new Response({ error: 'Email required' }, { status: 400 });
   }
   ```

## Security Considerations

### Client-Side
- Input validation (XSS prevention)
- File type/size validation
- No sensitive data in logs
- Environment variables for config

### Backend
- Server-side validation (trust nothing from client)
- CORS configuration
- Rate limiting (future)
- File sanitization

### Data Privacy
- No logging of personal information
- Ephemeral session IDs (not authentication)
- No data retention policy (demo only)

## Performance Optimizations

### Animation Performance
- **Reanimated**: Runs on UI thread (60fps guaranteed)
- **Shared Values**: Direct updates without JS bridge
- **worklet**: Animation logic compiled to native

### Component Performance
- **Memoization**: Could add `React.memo` for expensive components
- **Lazy Loading**: Not needed for current app size
- **Virtualization**: ScrollView suitable for file list size

### Network Performance
- **Axios**: Connection pooling, timeout handling
- **File Upload**: Base64 (simple but not optimal for large files)
- **Future**: Chunked upload, progress tracking

## Testing Strategy

### Unit Tests (Future)
```typescript
// Component tests with React Testing Library
test('TextInput validates email', () => {
  render(<TextInput validators={[{ type: 'email', ... }]} />);
  // Test validation logic
});

// Service tests
test('OnboardingService validates data', () => {
  const result = OnboardingService.validateOnboardingData(invalidData);
  expect(result.valid).toBe(false);
});
```

### Integration Tests (Future)
```typescript
// E2E with Detox
test('Complete onboarding workflow', async () => {
  await element(by.id('name-input')).typeText('John Doe');
  await element(by.id('submit-button')).tap();
  await expect(element(by.id('success-screen'))).toBeVisible();
});
```

## Scalability Considerations

### Current Limitations
- Local state (doesn't scale to many screens)
- Base64 files (doesn't scale to large files)
- No caching (unnecessary for current scope)

### Future Enhancements
1. **State Management**: Add Zustand or Redux
2. **File Storage**: Use Cloudflare R2 or AWS S3
3. **Caching**: Add react-query for server state
4. **Offline Support**: Add AsyncStorage + sync queue
5. **Analytics**: Add event tracking
6. **Error Tracking**: Add Sentry or similar

## Deployment Architecture

```
Developer Machine
    ↓ (git push)
GitHub Repository
    ↓ (CI/CD)
┌──────────────────────────────────────┐
│  EAS Build (Cloud)                   │
│  - Compile React Native              │
│  - Generate APK                      │
│  - Sign (optional)                   │
└──────────────────────────────────────┘
    ↓
Google Drive (APK Distribution)

Cloudflare Workers (Backend)
    ↓ (wrangler deploy)
Global Edge Network
    ├─ US
    ├─ Europe
    └─ Asia
```

## Design Patterns Used

1. **Component Composition**: Build complex UIs from simple components
2. **Render Props**: Flexible component APIs
3. **Container/Presentational**: Separate logic from UI
4. **Service Layer**: Encapsulate business logic
5. **Repository Pattern**: Abstract data access (API client)
6. **Factory Pattern**: Generate IDs, format data
7. **Observer Pattern**: React hooks (useState, useEffect)
8. **Singleton**: API client instance

## Trade-offs & Decisions

| Decision | Alternative | Reason |
|----------|-------------|--------|
| Expo | Bare React Native | Faster development, managed workflow |
| TypeScript | JavaScript | Type safety, better DX |
| Reanimated | Animated API | Better performance (UI thread) |
| Axios | Fetch | Interceptors, better error handling |
| Cloudflare Workers | Firebase/Supabase | Serverless, global, free tier |
| Base64 files | S3/R2 | Simplicity for demo (not production) |
| Local state | Redux/Zustand | Sufficient for small app |
| Mock backend | Real only | Offline development capability |

---

This architecture balances **simplicity** (for a 2-3 day assignment) with **production-mindedness** (demonstrating best practices and scalability awareness).




