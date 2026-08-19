import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IssueService } from '../../services/issue.service';

@Component({
  selector: 'app-issue-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './issue-form.component.html',
})
export class IssueFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  issueId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private issueService: IssueService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      department: [''],
      category: ['hardware', Validators.required],
      priority: ['Medium', Validators.required],
      status: ['Open', Validators.required],
      assignedTechnician: [''],
      description: ['', Validators.required],
      adminNotes: [''],
    });
  }

  ngOnInit(): void {
    this.issueId = this.route.snapshot.paramMap.get('id');
    if (this.issueId) {
      this.isEditMode = true;
      const issue = this.issueService.getById(this.issueId);
      if (issue) {
        this.form.patchValue(issue);
      }
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.issueId) {
      this.issueService.update(this.issueId, this.form.value);
    } else {
      this.issueService.create(this.form.value as any);
    }

    this.router.navigate(['/admin/issues']);
  }

  cancel(): void {
    this.router.navigate(['/admin/issues']);
  }
}
