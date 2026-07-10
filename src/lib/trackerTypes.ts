// Tracker Type System — defines the Kanban stages, colors, and badge
// styling for each ApplicationType. This is the single source of truth
// the tracker page reads from; add a new type here and the UI (form
// dropdown, filter tabs, columns, badges) picks it up automatically.

import type { ApplicationType } from "./types";

export interface TrackerTypeConfig {
  label: ApplicationType;
  // Ordered Kanban stages for this type. First = entry stage, last = terminal/success stage.
  stages: string[];
  // Stage names considered "closed" — used by the email backend / UI to
  // skip further deadline alerts and to visually mark a card as done.
  terminalStages: string[];
  // Badge color classes (Tailwind, matches the app's existing color tokens).
  badgeColor: string;
  // Small emoji/icon shown next to the type label in tabs & badges.
  icon: string;
}

export const TRACKER_TYPE_CONFIG: Record<ApplicationType, TrackerTypeConfig> = {
  Job: {
    label: "Job",
    stages: ["Applied", "Shortlisted", "Interview", "Offer Received", "Joined"],
    terminalStages: ["Offer Received", "Joined"],
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    icon: "💼",
  },
  Internship: {
    label: "Internship",
    stages: ["Applied", "Shortlisted", "Interview", "Selected", "Ongoing"],
    terminalStages: ["Selected", "Ongoing"],
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    icon: "🎓",
  },
  Hackathon: {
    label: "Hackathon",
    stages: ["Registered", "Submitted", "Shortlisted", "Finalist", "Winner"],
    terminalStages: ["Winner"],
    badgeColor: "bg-accent-gold-surface text-accent-gold border-accent-gold/20",
    icon: "🏆",
  },
  Scholarship: {
    label: "Scholarship",
    stages: ["Applied", "Under Review", "Shortlisted", "Selected"],
    terminalStages: ["Selected"],
    badgeColor: "bg-success-surface text-success border-success/20",
    icon: "🎗️",
  },
  Research: {
    label: "Research",
    stages: ["Applied", "Under Review", "Interview", "Selected"],
    terminalStages: ["Selected"],
    badgeColor: "bg-danger-surface text-danger border-danger/20",
    icon: "🔬",
  },
  Other: {
    label: "Other",
    stages: ["Applied", "In Progress", "Completed"],
    terminalStages: ["Completed"],
    badgeColor: "bg-surface-raised text-foreground-muted border-border",
    icon: "📌",
  },
};

export const TRACKER_TYPES: ApplicationType[] = [
  "Job",
  "Internship",
  "Hackathon",
  "Scholarship",
  "Research",
  "Other",
];

/** Stages for a given type, falling back to "Other" for unknown/legacy values. */
export function getStagesForType(type: ApplicationType | string | undefined): string[] {
  const config = TRACKER_TYPE_CONFIG[type as ApplicationType];
  return config ? config.stages : TRACKER_TYPE_CONFIG.Other.stages;
}

export function isTerminalStage(type: ApplicationType | string | undefined, stage: string): boolean {
  const config = TRACKER_TYPE_CONFIG[type as ApplicationType];
  return config ? config.terminalStages.includes(stage) : false;
}
