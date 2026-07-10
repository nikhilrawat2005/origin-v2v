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

// Kept for backward compatibility with any code still importing the old
// closed union. New code should treat status as a plain string (see
// ApplicationEntry["status"] below) since valid stages now depend on
// the entry's `type` — see TRACKER_TYPE_CONFIG in trackerTypes.ts.
export type ApplicationStatus =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Rejected"
  | "Selected"
  | "Offer Received";

// Tracker "type" — determines which stages / Kanban columns apply to an
// entry. See src/lib/trackerTypes.ts for the stage list + colors per type.
export type ApplicationType =
  | "Job"
  | "Internship"
  | "Hackathon"
  | "Scholarship"
  | "Research"
  | "Other";

export interface ApplicationEntry {
  id: string;
  uid: string;
  opportunityTitle: string;
  organization: string;
  deadline: string;
  applyLink?: string;
  notes?: string;
  // Widened from the old closed union to a plain string: each ApplicationType
  // has its own stage list (see trackerTypes.ts), so a single fixed union
  // across every type no longer applies. Always keep it in sync with an
  // entry's `type` — use TRACKER_TYPE_CONFIG[type].stages as the source of truth.
  status: string;
  // Defaults to "Other" for legacy entries that predate this field.
  type: ApplicationType;
  // Days-before-deadline thresholds (7/3/1) the backend has already emailed
  // for this entry, so it never sends the same alert twice.
  sentAlerts?: number[];
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

// ─── ORGANIZATION ACCESS REQUESTS ─────────────────────────────────────────

export type OrgRequestStatus = "pending" | "approved" | "rejected";

export interface OrgRequest {
  uid: string;
  orgName: string;
  website?: string;
  description: string;
  requesterName: string;
  requesterEmail: string;
  status: OrgRequestStatus;
  createdAt: string;
  reviewedAt?: string;
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

// Where this listing came from. "organization" = posted by a verified org
// account via the dashboard. "automated" = pulled in by the daily ingestion
// pipeline (see src/lib/ingestion).
export type OpportunitySource = "organization" | "automated";

// Only relevant when source === "automated".
// "trusted-feed" = official RSS/API (Grants.gov, Devpost, etc) — auto-approved.
// "scraped" = parsed from a web page — always starts as "pending" for review.
export type OpportunitySourceType = "trusted-feed" | "scraped";

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
  source?: OpportunitySource;
  sourceType?: OpportunitySourceType;
  sourceUrl?: string;
  ingestedAt?: string;
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
