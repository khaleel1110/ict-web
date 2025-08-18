import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import {EmailJSResponseStatus,} from 'emailjs-com';
import emailjs from 'emailjs-com'; // Import EmailJS

// Define Paystack interface for type safety
interface PaystackPop {
  setup: (config: {
    key: string;
    email: string;
    amount: number;
    ref: string;
    onClose: () => void;
    callback: (response: { reference: string; [key: string]: any }) => void;
  }) => { openIframe: () => void };
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

@Component({
  selector: 'app-pay-stack',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pay-stack.component.html',
  styleUrls: ['./pay-stack.component.scss']
})
export class PayStackComponent implements OnInit {
  paymentForm: FormGroup;
  isSubmitted = false;
  reference = '';

  constructor(private fb: FormBuilder) {
    this.paymentForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.min(100)]]
    });
  }

  ngOnInit() {
    this.generateReference();
    emailjs.init(environment.emailjsUserId); // Use environment variable for EmailJS User ID
  }

  // Generate a unique transaction reference
  generateReference() {
    this.reference = `ref-${Math.ceil(Math.random() * 10e13)}`;
  }

  // Handle form submission and initiate payment
  onSubmit() {
    this.isSubmitted = true;
    if (this.paymentForm.invalid) {
      alert('Please fill out the form correctly.');
      return;
    }

    if (typeof window.PaystackPop === 'undefined') {
      alert('Paystack is not loaded. Please check your internet connection and try again.');
      return;
    }

    const handler = window.PaystackPop.setup({
      key: environment.paystackPublicKey,
      email: this.paymentForm.value.email,
      amount: this.paymentForm.value.amount * 100, // Convert to kobo
      ref: this.reference,
      onClose: () => {
        this.paymentCancel();
      },
      callback: (response) => {
        this.paymentDone(response);
      }
    });

    handler.openIframe();
  }

  // Send email after successful payment
  private sendEmail() {
    const formValue = this.paymentForm.value;

    const emailParams = {
      to_email: 'aagwarzosportsarena@gmail.com',
      from_name: formValue.fullName,
      from_email: formValue.email,
      amount: formValue.amount,
      reference: this.reference
    };

    emailjs.send(environment.emailjsServiceId, environment.emailjsTemplateId, emailParams)
      .then((response: EmailJSResponseStatus) => {
        console.log('Email sent successfully!', response);
        alert(`Thank you, ${formValue.fullName}! Your payment and confirmation email have been sent successfully.`);
        this.paymentForm.reset();
        this.generateReference();
      })
      .catch((error) => {
        console.error('Failed to send email:', error);
        alert('Payment successful, but failed to send confirmation email. Please contact support.');
      });
  }

  // Handle successful payment
  paymentDone(response: { reference: string; [key: string]: any }) {
    console.log('Payment successful', response);
    alert('Payment successful! Reference: ' + response.reference);
    this.sendEmail(); // Send email after successful payment
  }

  // Handle payment cancellation or failure
  paymentCancel() {
    console.log('Payment cancelled');
    alert('Payment was cancelled.');
  }

  // Getter for form controls
  get formControls() {
    return this.paymentForm.controls;
  }
}
