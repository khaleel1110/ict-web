import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { addDoc, collection, Firestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import {CommonModule, NgIf} from '@angular/common';
import { DateComponent } from '../date/date.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';
import { environment } from '../../../environments/environment';
import { UsersService, AppointmentDetails } from '../../services/users.service';

interface PaystackPop {
  setup(config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onClose: () => void;
    callback: (response: { reference: string; [key: string]: any }) => void;
  }): { openIframe: () => void };
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

@Component({
  selector: 'app-booking',
  standalone: true,
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  imports: [CommonModule, FormsModule, DatePickerComponent, DateComponent, ReactiveFormsModule, FormsModule, NgIf, ReactiveFormsModule],
})
export class BookingComponent implements OnInit {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private usersService = inject(UsersService);
  profileForm: FormGroup;
  appointmentData: { date: Date | null; startHour: number | null; duration: number | null } = {
    date: null,
    startHour: null,
    duration: null,
  };
  isProcessingPayment = false;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^(0|\+234)\d{10}$/)]],
      phoneType: ['Mobile'],
      gender: ['', Validators.required],
      teamA: ['', [Validators.required, Validators.minLength(2)]],
      teamB: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      event: ['', Validators.required],
      hostel: ['', Validators.required],
      department: ['', Validators.required],
      appointmentDate: [null, Validators.required],
      appointmentStartHour: [null, Validators.required],
      appointmentDuration: [null, [Validators.required, Validators.min(1), Validators.max(8)]],
    });
  }

  ngOnInit() {
    this.loadPaystack();
  }

  onAppointmentChange(data: { date: Date | null; startHour: number | null; duration: number | null }) {
    this.appointmentData = data;
    this.profileForm.patchValue({
      appointmentDate: data.date,
      appointmentStartHour: data.startHour,
      appointmentDuration: data.duration,
    });
  }

  private sanitizeInput(value: string): string {
    return value.replace(/[<>]/g, '');
  }

  private formatAppointment(): string {
    const { date, startHour, duration } = this.appointmentData;
    if (!date || startHour === null || duration === null) return '';

    const startDate = new Date(date);
    startDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(startHour + duration, 0, 0, 0);

    const timeString =
      startDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }) +
      ' - ' +
      endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    const dateString = startDate.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' });

    return `${timeString}, ${dateString}`;
  }

  private isTimeSlotBooked(): boolean {
    const { date, startHour, duration } = this.appointmentData;
    if (!date || startHour === null || duration === null) return false;

    const selectedDateStart = new Date(date);
    selectedDateStart.setHours(0, 0, 0, 0);
    const startTime = new Date(date);
    startTime.setHours(startHour, 0, 0, 0);
    const endTime = new Date(date);
    endTime.setHours(startHour + duration, 0, 0, 0);

    const bookings = this.usersService.userSubject.getValue();
    return bookings.some(booking => {
      const bookingDate = new Date(booking.appointmentDate);
      bookingDate.setHours(0, 0, 0, 0);
      if (bookingDate.getTime() !== selectedDateStart.getTime()) return false;

      const bookingStartTime = new Date(booking.appointmentDate);
      bookingStartTime.setHours(booking.appointmentStartHour, 0, 0, 0);
      const bookingEndTime = new Date(booking.appointmentDate);
      bookingEndTime.setHours(booking.appointmentStartHour + booking.appointmentDuration, 0, 0, 0);

      return startTime < bookingEndTime && endTime > bookingStartTime;
    });
  }

  async handleSubmit() {
    if (this.isProcessingPayment) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      alert('Form is invalid. Please check your input.');
      return;
    }

    if (this.isTimeSlotBooked()) {
      alert('Selected time slot is already booked. Please choose another time.');
      return;
    }

    this.isProcessingPayment = true;

    try {
      if (typeof window['PaystackPop'] === 'undefined') {
        alert('Paystack is not loaded. Please check your internet connection and try again.');
        return;
      }

      const duration = this.profileForm.get('appointmentDuration')?.value;
      const amount = duration * 5000 * 100; // 5000 NGN per hour, converted to kobo
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
        },
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error initiating payment:', error);
      this.isProcessingPayment = false;
      alert('An error occurred while initiating payment. Please try again.');
    }
  }

  private loadPaystack(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack script'));
      document.head.appendChild(script);
    });
  }

  private async saveBooking(reference: string) {
    const formData = {
      firstName: this.sanitizeInput(this.profileForm.get('firstName')?.value),
      lastName: this.sanitizeInput(this.profileForm.get('lastName')?.value),
      email: this.profileForm.get('email')?.value,
      phone: this.sanitizeInput(this.profileForm.get('phone')?.value),
      phoneType: this.sanitizeInput(this.profileForm.get('phoneType')?.value),
      gender: this.sanitizeInput(this.profileForm.get('gender')?.value),
      teamA: this.sanitizeInput(this.profileForm.get('teamA')?.value),
      event: this.sanitizeInput(this.profileForm.get('event')?.value),
      hostel: this.sanitizeInput(this.profileForm.get('hostel')?.value),
      department: this.sanitizeInput(this.profileForm.get('department')?.value),
      teamB: this.sanitizeInput(this.profileForm.get('teamB')?.value),
      address: this.sanitizeInput(this.profileForm.get('address')?.value),
      appointmentDate: this.appointmentData.date,
      appointmentStartHour: this.appointmentData.startHour,
      appointmentDuration: this.appointmentData.duration,
      paymentReference: reference,
      amount: this.profileForm.get('appointmentDuration')?.value * 5000,
    };

    try {
      const userCollection = collection(this.firestore, 'bookings');
      const [firestoreResult, emailResult] = await Promise.all([
        addDoc(userCollection, formData),
        this.http.post('http://localhost:3000/send-booking-email', formData).toPromise(),
      ]);

      alert('Booking and payment successful! A confirmation has been sent to your email.');
      this.profileForm.reset();
      this.appointmentData = { date: null, startHour: null, duration: null };
    } catch (error) {
      console.error('Error processing booking:', error);
      alert('Booking was successful but we couldn\'t send the confirmation email. Please contact support with reference: ' + reference);
    } finally {
      this.isProcessingPayment = false;
    }
  }
}
