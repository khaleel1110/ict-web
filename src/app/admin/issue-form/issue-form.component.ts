import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { IssueService } from '../../services/issue.service';

@Component({
  selector: 'app-issue-form',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],

  templateUrl:
    './issue-form.component.html',
})
export class IssueFormComponent
  implements OnInit {

  form: FormGroup;

  isEditMode = false;

  issueId: string | null = null;

  isLoading = false;

  isSaving = false;

  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly issueService: IssueService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {

    this.form =
      this.fb.group({

        fullName: [
          '',
          Validators.required,
        ],

        email: [
          '',
          [
            Validators.required,
            Validators.email,
          ],
        ],

        phone: [''],

        department: [''],

        category: [
          'hardware',
          Validators.required,
        ],

        priority: [
          'Medium',
          Validators.required,
        ],

        status: [
          'Open',
          Validators.required,
        ],

        assignedTechnician: [''],

        description: [
          '',
          Validators.required,
        ],

        adminNotes: [''],
      });
  }

  // =========================================================
  // INIT
  // =========================================================

  async ngOnInit(): Promise<void> {

    this.issueId =
      this.route.snapshot.paramMap.get(
        'id'
      );

    if (!this.issueId) {
      return;
    }

    this.isEditMode = true;

    this.isLoading = true;

    this.errorMessage = '';

    try {

      const issue =
        await this.issueService.getById(
          this.issueId
        );

      if (!issue) {

        this.errorMessage =
          'Issue could not be found.';

        return;
      }

      this.form.patchValue({
        fullName:
        issue.fullName,

        email:
        issue.email,

        phone:
        issue.phone,

        department:
          issue.department ?? '',

        category:
        issue.category,

        priority:
        issue.priority,

        status:
        issue.status,

        assignedTechnician:
          issue.assignedTechnician ?? '',

        description:
        issue.description,

        adminNotes:
          issue.adminNotes ?? '',
      });

    } catch (error) {

      console.error(
        'Failed to load issue:',
        error
      );

      this.errorMessage =
        'Unable to load this issue.';

    } finally {

      this.isLoading = false;
    }
  }

  // =========================================================
  // SAVE
  // =========================================================

  async submit(): Promise<void> {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      return;
    }

    this.isSaving = true;

    this.errorMessage = '';

    try {

      if (
        this.isEditMode &&
        this.issueId
      ) {

        await this.issueService.update(
          this.issueId,
          this.form.getRawValue()
        );

      } else {

        await this.issueService.create(
          this.form.getRawValue()
        );
      }

      await this.router.navigate([
        '/admin/issues',
      ]);

    } catch (error) {

      console.error(
        'Failed to save issue:',
        error
      );

      this.errorMessage =
        'Unable to save the issue. Please try again.';

    } finally {

      this.isSaving = false;
    }
  }

  // =========================================================
  // CANCEL
  // =========================================================

  cancel(): void {

    this.router.navigate([
      '/admin/issues',
    ]);
  }
}
