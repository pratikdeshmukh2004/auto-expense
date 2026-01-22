# Components Structure

This directory contains all reusable React Native components organized by their purpose and functionality.

## 📁 Folder Structure

```
components/
├── animations/
│   ├── AnimatedBackground.tsx
│   ├── AnimatedCoins.tsx
│   ├── Shimmer.tsx
│   ├── SplashScreen.tsx
│   └── index.ts
├── features/
│   ├── CategoryBreakdown.tsx
│   ├── PaymentMethods.tsx
│   ├── PieChart.tsx
│   ├── SpendingTrends.tsx
│   ├── TransactionCard.tsx
│   └── index.ts
├── icons/
│   ├── GoogleIcon.tsx
│   ├── GoogleSheetsIcon.tsx
│   └── index.ts
├── layout/
│   ├── BottomNavigation.tsx
│   └── index.ts
├── modals/
│   ├── CategoryModal.tsx
│   ├── DateTimePickerModal.tsx
│   ├── PaymentMethodModal.tsx
│   ├── SelectSheetModal.tsx
│   ├── SettingsBottomSheet.tsx
│   ├── TermsModal.tsx
│   ├── TransactionApprovalModal.tsx
│   ├── TransactionFiltersModal.tsx
│   ├── TransactionModal.tsx
│   └── index.ts
└── index.ts
```

## 📦 Component Categories

### 🎬 Animations (`/animations`)
Visual effects and loading states
- **AnimatedBackground**: Dynamic background with time-based elements
- **AnimatedCoins**: Falling coins animation
- **Shimmer**: Loading skeleton component
- **SplashScreen**: App launch screen with animations

### 🎯 Features (`/features`)
Business logic components tied to specific features
- **CategoryBreakdown**: Expense/income category visualization
- **PaymentMethods**: Payment method cards display
- **PieChart**: Animated pie chart for data visualization
- **SpendingTrends**: Weekly spending chart
- **TransactionCard**: Individual transaction item

### 🎨 Icons (`/icons`)
Custom icon components
- **GoogleIcon**: Google logo SVG
- **GoogleSheetsIcon**: Google Sheets icon

### 📐 Layout (`/layout`)
App structure and navigation
- **BottomNavigation**: Bottom tab navigation bar

### 🪟 Modals (`/modals`)
Full-screen overlays and bottom sheets
- **CategoryModal**: Add/edit categories
- **DateTimePickerModal**: Custom date/time picker
- **PaymentMethodModal**: Add/edit payment methods
- **SelectSheetModal**: Google Sheets selector
- **SettingsBottomSheet**: Settings drawer wrapper
- **TermsModal**: Terms and conditions
- **TransactionApprovalModal**: Review pending transactions
- **TransactionFiltersModal**: Filter transactions
- **TransactionModal**: Add/edit transactions

## 🚀 Usage

Import components using named exports:

```typescript
// Import specific components
import { AnimatedBackground, Shimmer } from '@/components/animations';
import { CategoryBreakdown, PieChart, TransactionCard } from '@/components/features';
import { TransactionModal, SelectSheetModal } from '@/components/modals';

// Or import from main index
import { AnimatedBackground, CategoryBreakdown, TransactionModal } from '@/components';
```

## 📝 Guidelines

### Adding New Components

1. **Determine the category**: Choose the appropriate folder based on component purpose
2. **Create the component**: Add your `.tsx` file in the chosen folder
3. **Export in index**: Add export statement to the folder's `index.ts`
4. **Update main index**: Ensure the category is exported in root `index.ts`

### Component Naming

- Use **PascalCase** for component files: `MyComponent.tsx`
- Use **descriptive names** that indicate purpose
- Prefix modals with purpose: `TransactionModal`, `CategoryModal`

### When to Create New Folders

Create a new category folder when:
- You have 3+ components serving a similar purpose
- Components share common patterns or dependencies
- The category represents a distinct app feature

### Best Practices

- Keep components **focused** and **single-purpose**
- Use **TypeScript** interfaces for props
- Export **types** alongside components
- Add **JSDoc comments** for complex components
- Keep **styles** within component files using StyleSheet

## 🔄 Migration Notes

Components were reorganized from flat structure to categorized folders for:
- Better **discoverability**
- Easier **maintenance**
- Clearer **separation of concerns**
- Improved **scalability**

Old imports will need updating:
```typescript
// Old
import AnimatedBackground from '@/components/AnimatedBackground';

// New
import { AnimatedBackground } from '@/components/animations';
// or
import { AnimatedBackground } from '@/components';
```
