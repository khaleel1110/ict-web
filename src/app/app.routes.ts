import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { BookingComponent } from './features/booking/booking.component';

// If you want HomeComponent to have nested routing (child pages like booking, date, etc),
// it MUST include a <router-outlet> in its template!

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full' // Redirect empty path to /home
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'booking',
    component: BookingComponent
  },
  {
    path: 'date-picker',
    loadComponent: () => import('./features/date-picker/date-picker.component')
      .then(c => c.DatePickerComponent)
  },
  {
    path: 'date',
    loadComponent: () => import('./features/date/date.component')
      .then(c => c.DateComponent)
  },
  {
    path: 'debug',
    loadComponent: () => import('./features/debug/debug.component')
      .then(c => c.DebugComponent)
  },  {
    path: 'pay-stack',
    loadComponent: () => import('./features/pay-stack/pay-stack.component')
      .then(c => c.PayStackComponent)
  },{
    path: 'contact-us',
    loadComponent: () => import('./features/form-test/form-test.component')
      .then(c => c.FormTestComponent)
  },{
    path: 'blog',
    loadComponent: () => import('./features/blog/blog.component')
      .then(c => c.BlogComponent)
  },{
    path: 'about-us',
    loadComponent: () => import('./features/about-us/about-us.component')
      .then(c => c.AboutUsComponent)
  },{
    path: 'payment',
    loadComponent: () => import('./features/payment/payment.component')
      .then(c => c.PaymentComponent)
  }
];
