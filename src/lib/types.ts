// Central type definitions for Phase 3 — Bloom Opportunity Ecosystem
// All modules import from here. Do not define model interfaces elsewhere.

// ─── WALLET ────────────────────────────────────────────────────────────────

export type WalletCategory =
  | "Resume"
  | "Certificates"
  | "Awards"
  | "Projects"
  | "Portfolio"
  | "ID Documents";

export interface WalletDocument {
  id: string;
  uid: string;
  category: WalletCategory;
  name: string;
  storagePath: string;
  downloadURL: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

// ─── APPLICATION TRACKER ───────────────────────────────────────────────────

export type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Selected"
  | "Offer Received";

export interface ApplicationEntry {
  id: string;
  uid: string;
  opportunityTitle: string;
  organization: string;
  deadline: string;
  applyLink?: string;
  notes?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── CALENDAR ──────────────────────────────────────────────────────────────

export type CalendarEventType =
  | "deadline"
  | "interview"
  | "reminder"
  | "general"
  | "event";

export interface CalendarEvent {
  id: string;
  uid: string;
  title: string;
  date: string; // YYYY-MM-DD
  type: CalendarEventType;
  description?: string;
  linkedOpportunityId?: string;
  createdAt: string;
}

// ─── NOTIFICATIONS ─────────────────────────────────────────────────────────

export type NotificationCategory =
  | "deadline_alert"
  | "new_opportunity"
  | "application_update"
  | "interview_reminder"
  | "ai_suggestion";

export interface NotificationItem {
  id: string;
  uid: string;
  title: string;
  message: string;
  category: NotificationCategory;
  isRead: boolean;
  linkedRoute?: string;
  createdAt: string;
}

// ─── COMMUNITY ─────────────────────────────────────────────────────────────

export type CommunityTag =
  | "Scholarships"
  | "Career"
  | "Resume"
  | "Mentorship"
  | "General"
  | "Success Story";

export interface CommunityPost {
  id: string;
  authorUid: string;
  authorName: string;
  authorInitial: string;
  isAnonymous: boolean;
  title: string;
  body: string;
  tag: CommunityTag;
  likes: number;
  replyCount: number;
  createdAt: string;
}

export interface CommunityReply {
  id: string;
  postId: string;
  authorUid: string;
  authorName: string;
  authorInitial: string;
  isAnonymous: boolean;
  body: string;
  createdAt: string;
}

export interface MentorshipRequest {
  id: string;
  uid: string;
  name: string;
  field: string;
  goals: string;
  availability: string;
  createdAt: string;
}

// ─── ORGANIZATION ──────────────────────────────────────────────────────────

export interface OrgProfile {
  uid: string;
  name: string;
  logoURL?: string;
  website?: string;
  description?: string;
  createdAt: string;
}

export type OrgOpportunityStatus = "pending" | "approved" | "rejected";

export interface OrgOpportunity {
  id: string;
  postedByUid: string;
  orgName: string;
  title: string;
  description: string;
  eligibility: string;
  deadline: string;
  country: string;
  category: string;
  field: string;
  applyLink: string;
  requiredDocuments: string[];
  status: OrgOpportunityStatus;
  applicationCount: number;
  viewCount: number;
  createdAt: string;
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalOpportunities: number;
  orgPostedCount: number;
  seededCount: number;
  totalApplications: number;
  totalCommunityPosts: number;
}

// ─── USER ROLE ─────────────────────────────────────────────────────────────

export type UserRole = "user" | "organization" | "admin";
