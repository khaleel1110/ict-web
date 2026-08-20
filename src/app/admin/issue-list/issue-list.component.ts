import {
  Component,
  OnDestroy,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink,
} from '@angular/router';

import { Subscription } from 'rxjs';

import { IssueService } from '../../services/issue.service';

import {
  Issue,
  IssueStatus,
} from '../../models/issue.model';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-issue-list',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
  ],

  templateUrl:
    './issue-list.component.html',
})
export class IssueListComponent
  implements OnDestroy {

  issues: Issue[] = [];

  statusFilter = 'All';

  categoryFilter = 'All';

  searchTerm = '';

  selectedIssue: Issue | null = null;

  isLoading = true;

  errorMessage = '';

  private readonly subscriptions =
    new Subscription();

  constructor(
    private readonly issueService: IssueService,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {

    // -------------------------------------------------------
    // ISSUES
    // -------------------------------------------------------

    this.subscriptions.add(

      this.issueService.issues$
        .subscribe({
          next: (list) => {

            this.issues = list;

            this.isLoading = false;
          },

          error: (error) => {

            console.error(
              'Error loading issues:',
              error
            );

            this.isLoading = false;

            this.errorMessage =
              'Unable to load reported issues.';
          },
        })
    );

    // -------------------------------------------------------
    // LOADING
    // -------------------------------------------------------

    this.subscriptions.add(

      this.issueService.isLoading$
        .subscribe(
          (loading) => {
            this.isLoading = loading;
          }
        )
    );

    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------

    this.subscriptions.add(

      this.issueService.error$
        .subscribe(
          (error) => {
            this.errorMessage =
              error ?? '';
          }
        )
    );
  }

  // =========================================================
  // FILTER
  // =========================================================

  get filteredIssues(): Issue[] {

    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.issues.filter(
      (issue) => {

        const statusMatch =
          this.statusFilter === 'All' ||
          issue.status === this.statusFilter;

        const categoryMatch =
          this.categoryFilter === 'All' ||
          issue.category === this.categoryFilter;

        const searchMatch =
          !term ||
          issue.ticketId
            .toLowerCase()
            .includes(term) ||

          issue.fullName
            .toLowerCase()
            .includes(term) ||

          issue.email
            .toLowerCase()
            .includes(term);

        return (
          statusMatch &&
          categoryMatch &&
          searchMatch
        );
      }
    );
  }

  // =========================================================
  // COUNTS
  // =========================================================

  get counts() {

    return {

      total:
      this.issues.length,

      open:
      this.issues.filter(
        (issue) =>
          issue.status === 'Open'
      ).length,

      inProgress:
      this.issues.filter(
        (issue) =>
          issue.status === 'In Progress'
      ).length,

      resolved:
      this.issues.filter(
        (issue) =>
          issue.status === 'Resolved'
      ).length,
    };
  }

  // =========================================================
  // VIEW
  // =========================================================

  viewIssue(
    issue: Issue
  ): void {

    this.selectedIssue = issue;
  }

  closeView(): void {

    this.selectedIssue = null;
  }

  // =========================================================
  // ADD
  // =========================================================

  addIssue(): void {

    this.router.navigate([
      '/admin/issues/new',
    ]);
  }

  // =========================================================
  // EDIT
  // =========================================================

  editIssue(
    id: string
  ): void {

    this.router.navigate([
      '/admin/issues',
      id,
      'edit',
    ]);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async deleteIssue(
    id: string
  ): Promise<void> {

    const confirmed =
      confirm(
        'Delete this issue permanently? This cannot be undone.'
      );

    if (!confirmed) {
      return;
    }

    try {

      await this.issueService.delete(id);

      if (
        this.selectedIssue?.id === id
      ) {

        this.selectedIssue = null;
      }

    } catch (error) {

      console.error(
        'Failed to delete issue:',
        error
      );

      this.errorMessage =
        'Unable to delete this issue.';
    }
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async logout(): Promise<void> {

    await this.auth.logout();

    this.router.navigate([
      '/admin/login',
    ]);
  }

  // =========================================================
  // STATUS BADGE
  // =========================================================

  statusBadgeClass(
    status: IssueStatus
  ): string {

    switch (status) {

      case 'Open':
        return 'bg-danger';

      case 'In Progress':
        return 'bg-warning text-dark';

      case 'Resolved':
        return 'bg-success';

      case 'Closed':
        return 'bg-secondary';

      default:
        return 'bg-secondary';
    }
  }

  // =========================================================
  // DESTROY
  // =========================================================

  ngOnDestroy(): void {

    this.subscriptions.unsubscribe();
  }
}
