# Production Build Instructions

## Setup EAS Build

1. **Login to Expo**
   ```bash
   npx eas login
   ```

2. **Configure Project**
   ```bash
   npx eas build:configure
   ```

3. **Update Project ID**
   - After running configure, update the `projectId` in `app.json` with the generated ID

## Build APK

### Production Build
```bash
npm run build:android:production
```

### Preview Build (for testing)
```bash
npm run build:android:preview
```

## Build Profiles

- **development**: Development client with hot reload
- **preview**: Internal testing APK
- **production**: Production-ready APK for release

## Required Setup

1. **Expo Account**: Sign up at https://expo.dev
2. **EAS CLI**: Already installed globally
3. **Android Keystore**: EAS will generate automatically for first build

## Build Process

1. Code is uploaded to EAS servers
2. Dependencies are installed
3. Native code is generated
4. APK is built and signed
5. Download link is provided

## Download APK

After build completes:
- Check build status: `npx eas build:list`
- Download from Expo dashboard or direct link
- Install on Android device

## App Details

- **App Name**: Auto Expense
- **Package**: com.pratikdeshmukh.autoexpense
- **Version**: 1.0.0
- **Permissions**: SMS, Biometric, Notifications