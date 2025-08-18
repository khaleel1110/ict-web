import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { HttpClient,  } from '@angular/common/http';


@Component({
  selector: 'app-form-test',
  standalone: true,
  imports: [ReactiveFormsModule,],
  templateUrl: './form-test.component.html',
  styleUrl: './form-test.component.scss',
})
export class FormTestComponent  {
  profileForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  submit() {
    if (this.profileForm.valid) {
      this.http.post('http://localhost:3000/send-email', this.profileForm.value)
        .subscribe({
          next: (response) => {
            alert('Message sent successfully!');
            this.profileForm.reset();
          },
          error: (error) => {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again later.');
          }
        });
    }
  }
}
