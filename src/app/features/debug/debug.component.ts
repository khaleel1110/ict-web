import { Component, inject, OnInit } from '@angular/core';
import { DateComponent } from '../date/date.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf, CommonModule } from '@angular/common';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {AppointmentDetails, UsersService} from '../../services/users.service';


@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [DateComponent, ReactiveFormsModule, NgIf, CommonModule],
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss']
})
export class DebugComponent implements OnInit {
  private firestore = inject(Firestore);
  profileForm: FormGroup;
  appointmentData: { date: Date | null; startHour: number | null; duration: number | null } = {
    date: null,
    startHour: null,
    duration: null
  };
  isProcessingPayment = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private usersService: UsersService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      phoneType: ['Mobile'],
      gender: [''],
      location: ['', Validators.required],
      localGovernment: ['', Validators.required],
      teamA: ['', Validators.required],
      teamB: ['', Validators.required],
      address: ['', Validators.required],
      appointmentDate: [null, Validators.required],
      appointmentStartHour: [null, Validators.required],
      appointmentDuration: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.profileForm.get('appointmentDate')?.valueChanges.subscribe(() => this.validateAppointment());
    this.profileForm.get('appointmentStartHour')?.valueChanges.subscribe(() => this.validateAppointment());
    this.profileForm.get('appointmentDuration')?.valueChanges.subscribe(() => this.validateAppointment());
    this.loadPaystack();
  }

  onAppointmentChange(data: { date: Date | null; startHour: number | null; duration: number | null }) {
    this.appointmentData = data;
    this.profileForm.patchValue({
      appointmentDate: data.date,
      appointmentStartHour: data.startHour,
      appointmentDuration: data.duration
    });
    this.validateAppointment();
  }

  private validateAppointment() {
    const { date, startHour, duration } = this.appointmentData;
    if (date && startHour !== null && duration !== null) {
      this.profileForm.get('appointmentDate')?.setErrors(null);
      this.profileForm.get('appointmentStartHour')?.setErrors(null);
      this.profileForm.get('appointmentDuration')?.setErrors(null);
    } else {
      this.profileForm.get('appointmentDate')?.setErrors({ required: true });
      this.profileForm.get('appointmentStartHour')?.setErrors({ required: true });
      this.profileForm.get('appointmentDuration')?.setErrors({ required: true });
    }
  }

  private formatAppointment(): string {
    const { date, startHour, duration } = this.appointmentData;
    if (!date || startHour === null || duration === null) return '';

    const startDate = new Date(date);
    const adjustedStartHour = startHour % 24;
    startDate.setHours(adjustedStartHour, 0, 0, 0);

    const endDate = new Date(date);
    const endHour = (startHour + duration) % 24;
    const endDayOffset = Math.floor((startHour + duration) / 24);
    endDate.setDate(endDate.getDate() + endDayOffset);
    endDate.setHours(endHour, 0, 0, 0);

    const timeString =
      startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) +
      ' - ' +
      endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateString = startDate.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });

    return `${timeString}, ${dateString}`;
  }

  async handleSubmit() {
    if (this.isProcessingPayment) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      alert('Form is invalid. Please check your input.');
      return;
    }

    const { date, startHour, duration } = this.appointmentData;
    if (date && startHour !== null && duration !== null) {
      const isOverlapping = await this.checkForOverlap(date, startHour, duration);
      if (isOverlapping) {
        alert(
          'The selected duration overlaps with an existing booking. Please adjust the duration or choose another time slot.'
        );
        return;
      }
    } else {
      alert('Please select a valid date, start time, and duration.');
      return;
    }

    this.isProcessingPayment = true;

    try {
      if (typeof window['PaystackPop'] === 'undefined') {
        alert('Paystack is not loaded. Please check your internet connection and try again.');
        return;
      }

      const duration = this.profileForm.get('appointmentDuration')?.value;
      if (!duration || duration < 1 || duration > 8) {
        alert('Invalid duration. Please select 1 to 8 hours.');
        return;
      }

      const amount = duration * 5000 * 100;
      const reference = `ref-${Math.ceil(Math.random() * 10e13)}`;

      const handler = window['PaystackPop'].setup({
        key: environment.paystackPublicKey,
        email: this.profileForm.get('email')?.value,
        amount: amount,
        ref: reference,
        onClose: () => {
          alert('Payment cancelled.');
          this.isProcessingPayment = false;
        },
        callback: (response: { reference: string; [key: string]: any }) => {
          this.saveBooking(response.reference);
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initiating payment:', error);
      this.isProcessingPayment = false;
      alert('An error occurred while initiating payment. Please try again.');
    }
  }

  private loadPaystack(): Promise<void> {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  private async saveBooking(reference: string) {
    const formData = {
      ...this.profileForm.value,
      appointment: this.formatAppointment(),
      paymentReference: reference,
      amount: this.profileForm.get('appointmentDuration')?.value * 5000
    };

    const emailData = {
      ...formData
    };

    try {
      const userCollection = collection(this.firestore, 'bookings');
      const [firestoreResult, emailResult] = await Promise.all([
        addDoc(userCollection, formData),
        this.http.post('http://localhost:3000/send-booking-email', emailData).toPromise()
      ]);

      alert('Booking and payment successful! A confirmation has been sent to your email.');
      this.profileForm.reset();
    } catch (error) {
      console.error('Error processing booking:', error);
      alert(
        'Booking was successful but we couldn\'t send the confirmation email. Please contact support with reference: ' +
        reference
      );
    } finally {
      this.isProcessingPayment = false;
    }
  }

  private async checkForOverlap(date: Date, startHour: number, duration: number): Promise<boolean> {
    const bookings = this.usersService.userSubject.getValue();
    const selectedDateStart = new Date(date);
    selectedDateStart.setHours(0, 0, 0, 0);

    const adjustedStartHour = startHour % 24;
    const startTime = new Date(date);
    startTime.setHours(adjustedStartHour, 0, 0, 0);

    const endHour = (startHour + duration) % 24;
    const endDayOffset = Math.floor((startHour + duration) / 24);
    const endTime = new Date(date);
    endTime.setDate(endTime.getDate() + endDayOffset);
    endTime.setHours(endHour, 0, 0, 0);

    return bookings.some((booking: AppointmentDetails) => {
      const bookingDate = new Date(booking.appointmentDate);
      bookingDate.setHours(0, 0, 0, 0);

      if (bookingDate.getTime() !== selectedDateStart.getTime()) {
        return false;
      }

      const bookingStartHour = booking.appointmentStartHour % 24;
      const bookingStartTime = new Date(booking.appointmentDate);
      bookingStartTime.setHours(bookingStartHour, 0, 0, 0);

      const bookingEndHour = (booking.appointmentStartHour + booking.appointmentDuration) % 24;
      const bookingEndDayOffset = Math.floor(
        (booking.appointmentStartHour + booking.appointmentDuration) / 24
      );
      const bookingEndTime = new Date(booking.appointmentDate);
      bookingEndTime.setDate(bookingEndTime.getDate() + bookingEndDayOffset);
      bookingEndTime.setHours(bookingEndHour, 0, 0, 0);

      return (
        (startTime < bookingEndTime && endTime > bookingStartTime) ||
        (startTime <= bookingStartTime && endTime >= bookingEndTime)
      );
    });
  }
}
