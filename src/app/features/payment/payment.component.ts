import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  email = 'customer@email.com';
  amount = 5000; // amount in Naira

  constructor(private paymentService: PaymentService) {}

  pay() {
    const amountInKobo = this.amount * 100;

    // Check if Paystack script is loaded
    const paystack = (window as any).PaystackPop;
    if (!paystack) {
      alert('Paystack script is not loaded. Please check your index.html');
      return;
    }

    this.paymentService.initializePayment({
      email: this.email,
      amount: amountInKobo
    }).subscribe({
      next: (res: any) => {
        if (res.status && res.data && res.data.reference) {
          const handler = new paystack();
          handler.newTransaction({
            key: 'pk_test_de07139d9eacbf37b7d3fd533f82838cfeb58c12', // Use your actual public key
            reference: res.data.reference,
            email: this.email,
            amount: amountInKobo,
            onSuccess: (transaction: any) => {
              alert('Payment successful! Reference: ' + transaction.reference);
              // Optionally call backend to verify payment
            },
            onCancel: () => {
              alert('Transaction cancelled.');
            }
          });
        } else {
          alert('Invalid payment initialization response.');
        }
      },
      error: (err) => {
        console.error('Error initializing payment:', err);
        alert('There was an error initializing the payment.');
      }
    });
  }
}
