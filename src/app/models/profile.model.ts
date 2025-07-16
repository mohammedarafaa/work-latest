export interface NotificationPreference {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  billReminders: boolean;
  usageAlerts: boolean;
  appearanceMode: 'LIGHT' | 'DARK' | 'SYSTEM';
}

export interface SavedCard {
  id: number;
  maskedCard: string;
  brand: string;
}

export interface PersonalInfo {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  passwordLastChangedAt: string;
  street: string;
  buildingNumber: string;
  accountType: string;
}

export interface EditProfileRequest {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword_Req: string;
}

export interface AddCardRequest {
  userId: number;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  brand: string;
}
