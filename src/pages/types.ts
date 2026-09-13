export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location?: string;
  dateApplied: string;
  status: "Applied" | "Under Review" | "Assessment" | "Interview" | "Offer" | "Rejected" | "Withdrawn";
  url?: string;
  contact?: string;
  followUpDate?: string;
  salary?: string;
  notes?: string;
  createdAt?: unknown;
}

export interface Trade {
  id: string;
  date: string;
  pair: string;
  direction: "Buy" | "Sell";
  entry: number;
  exit: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize?: number;
  pl: number;
  strategy?: string;
  result: "Win" | "Loss" | "Break-even";
  followedRules: "Yes" | "Partially" | "No";
  notes?: string;
  createdAt?: unknown;
}

export interface Certification {
  id: string;
  name: string;
  provider?: string;
  code?: string;
  status: "Planned" | "In Progress" | "Completed" | "Paused";
  progress: number;
  startDate?: string;
  targetDate?: string;
  completedDate?: string;
  examDate?: string;
  certUrl?: string;
  notes?: string;
  createdAt?: unknown;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  category: "Job" | "Interview" | "Follow-up" | "Learning" | "Forex" | "Personal";
  notes?: string;
  reminder?: boolean;
  createdAt?: unknown;
}

export interface Reminder {
  id: string;
  title: string;
  dueDate: string;
  dueTime?: string;
  category?: string;
  recurring?: "none" | "daily" | "weekly" | "monthly";
  completed: boolean;
  notes?: string;
  createdAt?: unknown;
}

export interface MonthlyReview {
  id: string;
  month: string;
  year: number;
  wellDone?: string;
  improve?: string;
  nextGoal?: string;
  createdAt?: unknown;
}
