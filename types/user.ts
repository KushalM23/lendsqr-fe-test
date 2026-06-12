export type UserStatus = 'active' | 'inactive' | 'blacklisted' | 'pending';

export interface PersonalInformation {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  bvn: string;
  gender: string;
  maritalStatus: string;
  children: number | string;
  typeOfResidence: string;
}

export interface EducationAndEmployment {
  levelOfEducation: string;
  employmentStatus: string;
  sectorOfEmployment: string;
  durationOfEmployment: string;
  officeEmail: string;
  monthlyIncome: {
    min: number;
    max: number;
  };
  loanRepayment: number;
}

export interface Socials {
  twitter: string;
  facebook: string;
  instagram: string;
}

export interface Guarantor {
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  relationship: string;
}

export interface BankDetails {
  accountNumber: string;
  bankName: string;
  accountType: string;
  bvn: string;
}

export interface DocumentInfo {
  id: string;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface SavingsAccount {
  id: string;
  accountName: string;
  balance: number;
  currency: string;
}

export interface Savings {
  totalSavings: number;
  savingsAccounts: SavingsAccount[];
}

export interface LoanInformation {
  totalLoans: number;
  totalOutstandingBalance: number;
  loans: unknown[];
}

export interface AppAndSystem {
  registrationDate: string;
  lastLogin: string;
  appVersion: string;
  lastUpdated: string;
}

export interface User {
  id: string;
  organization: string;
  username: string;
  email: string;
  phoneNumber: string;
  dateJoined: string;
  status: UserStatus;
  personalInformation: PersonalInformation;
  educationAndEmployment: EducationAndEmployment;
  socials: Socials;
  guarantor: Guarantor[];
  bankDetails: BankDetails;
  documents: DocumentInfo[];
  loanInformation: LoanInformation;
  savings: Savings;
  appAndSystem: AppAndSystem;
  accountTier: string; // "bronze" | "silver" | "gold" | "platinum"
  userStatus?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponseData {
  users: Array<Pick<User, 'id' | 'organization' | 'username' | 'email' | 'phoneNumber' | 'dateJoined' | 'status'>>;
  pagination: PaginationInfo;
}

export interface SingleUserResponseData {
  status: string;
  message: string;
  data: User;
}

export interface UsersListResponse {
  status: string;
  message: string;
  data: UsersResponseData;
}
