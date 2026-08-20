import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {RouterLink} from '@angular/router';

import {IssueService} from '../services/issue.service';
import {Issue} from '../models/issue.model';

@Component({
  selector: 'app-report-issue',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],

  templateUrl:
    './report-issue.component.html',
})
export class ReportIssueComponent {

  issueForm: FormGroup;

  isSubmitting = false;

  submittedIssue: Issue | null = null;

  submitError = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly issueService: IssueService
  ) {

    this.issueForm =
      this.fb.group({

        firstName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.minLength(2),
          ],
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
          ],
        ],

        phone: [
          '',
          [
            Validators.pattern(
              /^(\+234|0)[789][01]\d{8}$/
            ),
          ],
        ],

        department: [''],

        category: [
          '',
          Validators.required,
        ],

        priority: [
          'Medium',
          Validators.required,
        ],

        description: [
          '',
          [
            Validators.required,
            Validators.minLength(10),
          ],
        ],
      });
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async handleSubmit(): Promise<void> {

    if (this.issueForm.invalid) {

      this.issueForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    this.submitError = '';

    const value =
      this.issueForm.getRawValue();

    try {

      const issue =
        await this.issueService.create({

          fullName:
            `${value.firstName} ${value.lastName}`.trim(),

          email:
          value.email,

          phone:
            value.phone ?? '',

          department:
            value.department ?? '',

          category:
          value.category,

          priority:
          value.priority,

          description:
          value.description,

          // These are not supplied by the
          // public form because the service
          // automatically creates them.
        });

      // Show ticket to the user
      this.submittedIssue = issue;

      // Reset form
      this.issueForm.reset({
        priority: 'Medium',
      });

      console.log(
        'Report submitted successfully:',
        issue
      );

    } catch (error) {

      console.error(
        'Failed to submit issue:',
        error
      );

      this.submitError =
        'Something went wrong while submitting your complaint. Please try again.';

    } finally {

      this.isSubmitting = false;
    }
  }

  // =========================================================
  // REPORT ANOTHER
  // =========================================================

  reportAnother(): void {

    this.submittedIssue = null;

    this.submitError = '';

    this.issueForm.reset({
      priority: 'Medium',
    });
  }
}
