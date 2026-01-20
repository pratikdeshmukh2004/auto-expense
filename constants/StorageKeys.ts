// Storage keys used throughout the app
export const StorageKeys = {
  // Auth & User
  USER_TOKEN: 'user_token',
  USER_MPIN: 'user_mpin',
  USER_GUEST: 'user_is_guest',
  USER_NAME: 'user_name',
  USER_EMAIL: 'user_email',
  USER_PHOTO: 'user_photo',
  
  // App Data
  CATEGORIES: 'categories',
  PAYMENT_METHODS: 'payment_methods',
  BANK_KEYWORDS: 'bank_keywords',
  TRANSACTIONS: 'app_transactions',
  
  // Settings
  STORAGE_TYPE: 'storage_type',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  AUTO_PARSING_ENABLED: 'auto_parsing_enabled',
  
  // Parsing
  PARSED_TRANSACTIONS: 'parsed_transactions',
  APPROVED_SENDERS: 'approved_senders',
  LAST_EMAIL_SYNC: 'last_email_sync',
  
  // Google Sheets Integration
  GOOGLE_SHEET_ID: 'google_sheet_id',
  GOOGLE_SHEET_URL: 'google_sheet_url',
} as const;
