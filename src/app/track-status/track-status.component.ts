import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IssueService } from '../services/issue.service';
import { Issue } from '../models/issue.model';

@Component({
  selector: 'app-track-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './track-status.component.html',
})
export class TrackStatusComponent {
  searchForm: FormGroup;
  result: Issue | null = null;
  notFound = false;
  searched = false;

  constructor(private fb: FormBuilder, private issueService: IssueService) {
    this.searchForm = this.fb.group({
      ticketId: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }
    this.searched = true;
    const { ticketId, email } = this.searchForm.value;
    const found = this.issueService.getByTicketId(ticketId);

    if (found && found.email.toLowerCase() === String(email).toLowerCase()) {
      this.result = found;
      this.notFound = false;
    } else {
      this.result = null;
      this.notFound = true;
    }
  }

  statusBadgeClass(status: string): string {
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
