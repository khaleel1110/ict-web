// time-picker-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-time-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Select Time Range</h2>
    <div mat-dialog-content>
      <div class="time-range-container">
        <mat-form-field>
          <mat-label>From</mat-label>
          <input matInput type="time" [(ngModel)]="timeRange.start">
        </mat-form-field>

        <mat-form-field>
          <mat-label>To</mat-label>
          <input matInput type="time" [(ngModel)]="timeRange.end" [min]="timeRange.start">
        </mat-form-field>
      </div>

      <mat-form-field *ngIf="showDuration">
        <mat-label>Duration</mat-label>
        <mat-select [(ngModel)]="selectedDuration" (selectionChange)="calculateEndTime()">
          <mat-option *ngFor="let duration of durations" [value]="duration.value">
            {{ duration.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </div>
    <div mat-dialog-actions>
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-button color="primary" (click)="onSave()" [disabled]="!isTimeRangeValid()">Save</button>
    </div>
  `,
  styles: [`
    .time-range-container {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;

      mat-form-field {
        flex: 1;
      }
    }
  `]
})
export class TimePickerDialogComponent {
  timeRange = {
    start: '09:00',
    end: '10:00'
  };

  showDuration = true;
  selectedDuration = 60;
  durations = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' }
  ];

  constructor(
    public dialogRef: MatDialogRef<TimePickerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { date: Date }
  ) {
    // Set initial times to current time and +1 hour
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');

    this.timeRange.start = `${hours}:${minutes}`;

    const endTime = new Date(now.getTime() + 60 * 60 * 1000);
    const endHours = endTime.getHours().toString().padStart(2, '0');
    const endMinutes = endTime.getMinutes().toString().padStart(2, '0');
    this.timeRange.end = `${endHours}:${endMinutes}`;
  }

  calculateEndTime() {
    if (!this.timeRange.start || !this.selectedDuration) return;

    const [startHours, startMinutes] = this.timeRange.start.split(':').map(Number);
    const startDate = new Date(this.data.date);
    startDate.setHours(startHours, startMinutes);

    const endDate = new Date(startDate.getTime() + this.selectedDuration * 60 * 1000);
    const endHours = endDate.getHours().toString().padStart(2, '0');
    const endMinutes = endDate.getMinutes().toString().padStart(2, '0');

    this.timeRange.end = `${endHours}:${endMinutes}`;
  }

  isTimeRangeValid(): boolean {
    if (!this.timeRange.start || !this.timeRange.end) return false;

    const [startHours, startMinutes] = this.timeRange.start.split(':').map(Number);
    const [endHours, endMinutes] = this.timeRange.end.split(':').map(Number);

    // Convert to minutes for easy comparison
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    return endTotal > startTotal;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close({
      date: this.data.date,
      timeRange: this.timeRange,
      duration: this.selectedDuration
    });
  }
}
