import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IssueService } from '../services/issue.service';
import { Issue } from '../models/issue.model';

@Component({
  selector: 'app-report-issue',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './report-issue.component.html',
})
export class ReportIssueComponent {
  issueForm: FormGroup;
  isSubmitting = false;
  submittedIssue: Issue | null = null;

  constructor(private fb: FormBuilder, private issueService: IssueService) {
    this.issueForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^(\+234|0)[789][01]\d{8}$/)]],
      department: [''],
      category: ['', Validators.required],
      priority: ['Medium', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  handleSubmit(): void {
    if (this.issueForm.invalid) {
      this.issueForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const v = this.issueForm.value;

    const issue = this.issueService.create({
      fullName: `${v.firstName} ${v.lastName}`,
      email: v.email,
      phone: v.phone,
      department: v.department,
      category: v.category,
      priority: v.priority,
      description: v.description,
    });

    this.submittedIssue = issue;
    this.isSubmitting = false;
    this.issueForm.reset({ priority: 'Medium' });
  }

  reportAnother(): void {
    this.submittedIssue = null;
  }
}
