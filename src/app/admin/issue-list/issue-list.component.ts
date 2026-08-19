import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IssueService } from '../../services/issue.service';
import { AuthService } from '../../services/auth.service';
import { Issue, IssueStatus } from '../../models/issue.model';

@Component({
  selector: 'app-issue-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './issue-list.component.html',
})
export class IssueListComponent {
  issues: Issue[] = [];
  statusFilter = 'All';
  categoryFilter = 'All';
  searchTerm = '';
  selectedIssue: Issue | null = null;

  constructor(
    private issueService: IssueService,
    private auth: AuthService,
    private router: Router
  ) {
    this.issueService.issues$.subscribe((list) => (this.issues = list));
  }

  get filteredIssues(): Issue[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.issues.filter((i) => {
      const statusMatch = this.statusFilter === 'All' || i.status === this.statusFilter;
      const categoryMatch = this.categoryFilter === 'All' || i.category === this.categoryFilter;
      const searchMatch =
        !term ||
        i.ticketId.toLowerCase().includes(term) ||
        i.fullName.toLowerCase().includes(term) ||
        i.email.toLowerCase().includes(term);
      return statusMatch && categoryMatch && searchMatch;
    });
  }

  get counts() {
    return {
      total: this.issues.length,
      open: this.issues.filter((i) => i.status === 'Open').length,
      inProgress: this.issues.filter((i) => i.status === 'In Progress').length,
      resolved: this.issues.filter((i) => i.status === 'Resolved').length,
    };
  }

  viewIssue(issue: Issue): void {
    this.selectedIssue = issue;
  }

  closeView(): void {
    this.selectedIssue = null;
  }

  addIssue(): void {
    this.router.navigate(['/admin/issues/new']);
  }

  editIssue(id: string): void {
    this.router.navigate(['/admin/issues', id, 'edit']);
  }

  deleteIssue(id: string): void {
    if (confirm('Delete this issue permanently? This cannot be undone.')) {
      this.issueService.delete(id);
      if (this.selectedIssue?.id === id) {
        this.selectedIssue = null;
      }
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }

  statusBadgeClass(status: IssueStatus): string {
    switch (status) {
      case 'Open':
        return 'bg-danger';
      case 'In Progress':
        return 'bg-warning text-dark';
      case 'Resolved':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
}
