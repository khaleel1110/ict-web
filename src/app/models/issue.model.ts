export type IssueCategory = 'hardware' | 'software' | 'network' | 'account' | 'other';
export type IssueStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Issue {
  id: string;
  ticketId: string;
  fullName: string;
  email: string;
  phone: string;
  department?: string;
  category: IssueCategory;
  description: string;
  priority: IssuePriority;
  status: IssueStatus;
  assignedTechnician?: string;
  adminNotes?: string;
  dateReported: string; // ISO string
  dateUpdated: string;  // ISO string
}
