# Auto Expense 💰

A smart expense tracking app built with React Native and Expo that automatically parses transaction notifications and categorizes expenses.

## 🚀 Features

### 🔐 Authentication
- **MPIN Security**: 4-digit PIN for quick access
- **Biometric Login**: Face ID and Fingerprint support
- **Generate MPIN**: First-time setup for new users

### 📊 Dashboard
- **Income/Expense Overview**: Visual spending summary
- **Category Breakdown**: Pie chart of expense categories
- **Payment Methods**: Quick access to cards and accounts
- **Spending Trends**: Weekly/monthly spending patterns
- **Recent Transactions**: Latest expense entries

### 💳 Transaction Management
- **Manual Entry**: Add transactions with amount, merchant, category
- **Edit/Duplicate**: Swipe gestures to modify transactions
- **Transaction Details**: Comprehensive view with spending insights
- **Search & Filter**: Find transactions by merchant or category

### 🤖 Smart Parsing
- **Auto-Parsing**: Reads SMS and email notifications automatically
- **Bank Keywords**: Customizable keywords for better parsing
- **Transaction Approval**: Review and approve parsed transactions
- **Sender Management**: Approve/reject notification senders

### ⚙️ Settings
- **Profile Management**: User info and preferences
- **Data Parsing Controls**: Toggle auto-parsing features
- **Notification Settings**: Daily summaries and alerts
- **Security Options**: Biometric locks and privacy settings

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router (file-based routing)
- **Storage**: Expo SecureStore for sensitive data
- **Authentication**: Expo LocalAuthentication (biometrics)
- **Notifications**: Expo Notifications
- **UI Components**: React Native built-in components
- **Styling**: StyleSheet (no external UI library)

## 📱 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autoexpo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Scan QR code with Expo Go app
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

## 📦 Build Commands

### Local Build (Using Scripts)

**Build Android APK:**
```bash
bash scripts/build-apk.sh
```

**Build iOS IPA:**
```bash
bash scripts/build-ipa.sh
```

**Get SHA-1 Certificate:**
```bash
bash scripts/get-sha1.sh
```

### EAS Build (Expo Application Services)

**Setup EAS:**
```bash
npm install -g eas-cli
eas login
eas build:configure
```

**Build Android APK:**
```bash
# Development build
eas build --platform android --profile development

# Preview build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

**Build iOS IPA:**
```bash
# Development build
eas build --platform ios --profile development

# Preview build
eas build --platform ios --profile preview

# Production build (for App Store)
eas build --platform ios --profile production
```

**Build for Both Platforms:**
```bash
eas build --platform all --profile preview
```

**Check Build Status:**
```bash
eas build:list
```

## 🏗️ Project Structure

```
autoexpo/
├── app/                          # App screens (file-based routing)
│   ├── auth/                     # Authentication screens
│   │   ├── login.tsx            # Google login screen
│   │   ├── generate-mpin.tsx    # MPIN creation
│   │   └── mpin.tsx             # MPIN entry with biometrics
│   ├── dashboard/               # Dashboard screens
│   │   └── index.tsx            # Main dashboard
│   ├── transactions/            # Transaction screens
│   │   ├── index.tsx            # Transaction list
│   │   └── details.tsx          # Transaction details
│   ├── settings/                # Settings screens
│   │   ├── index.tsx            # Settings menu
│   │   └── bank-keywords.tsx    # Bank keywords management
│   ├── _layout.tsx              # Root layout with navigation
│   └── index.tsx                # Landing/redirect screen
├── components/                   # Reusable components
│   ├── AddTransactionModal.tsx  # Add transaction modal
│   ├── EditTransactionModal.tsx # Edit transaction modal
│   ├── BankKeywordsModal.tsx    # Bank keywords modal (deprecated)
│   ├── BottomNavigation.tsx     # Bottom tab navigation
│   └── GoogleIcon.tsx           # Google login icon
├── services/                     # Business logic services
│   ├── AuthService.ts           # Authentication management
│   ├── NotificationParser.ts    # SMS/Email parsing logic
│   └── AndroidNotificationListener.ts # Android notification access
└── README.md                    # This file
```

## 🔧 Key Services

### AuthService
- User authentication state management
- MPIN storage and verification
- Login/logout functionality

### NotificationParser
- SMS and email transaction parsing
- Keyword-based categorization
- Transaction CRUD operations
- Secure storage integration

### AndroidNotificationListener
- Real-time notification monitoring
- Keyword matching for transactions
- Automatic transaction creation

## 🎨 Design System

- **Primary Color**: #EA2831 (Red)
- **Background**: #f8f6f6 (Light gray)
- **Typography**: System fonts with various weights
- **Components**: Custom styled with React Native StyleSheet
- **Icons**: Ionicons from @expo/vector-icons

## 📋 Features Breakdown

### Authentication Flow
1. Landing screen checks login status
2. New users → Login → Generate MPIN → Dashboard
3. Returning users → MPIN entry → Dashboard
4. Biometric authentication available on supported devices

### Transaction Parsing
1. Monitors incoming notifications
2. Matches against stored keywords
3. Parses merchant, amount, and category
4. Creates transaction automatically
5. Flags complex transactions for review

### Data Storage
- **Secure Storage**: Authentication tokens, MPIN, sensitive data
- **Local Storage**: Transaction history, keywords, preferences
- **Privacy**: All data processed locally, never sent to servers

## 🔒 Security Features

- **MPIN Protection**: 4-digit PIN for app access
- **Biometric Authentication**: Face ID/Fingerprint support
- **Secure Storage**: Encrypted storage for sensitive data
- **Local Processing**: All parsing happens on-device
- **No Data Transmission**: Privacy-first approach

## 🚧 Development Notes

### Current Limitations
- Notification parsing requires native Android module for full functionality
- iOS notification access is restricted by platform security
- Bank API integration not implemented (manual entry primary method)

### Future Enhancements
- Bank API integrations
- Receipt scanning with OCR
- Advanced analytics and insights
- Export functionality
- Multi-currency support

## 📄 License

This project is for educational and demonstration purposes.

## 👨‍💻 Developer

**Pratik Deshmukh**
- Email: pratikdeshmukhlobhi@gmail.com
- GitHub: [@pratikdeshmukh](https://github.com/pratikdeshmukh)

---

Built with ❤️ using React Native and Expo