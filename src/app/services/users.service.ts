import { inject, Injectable } from '@angular/core';
import { collection, collectionData, Firestore } from '@angular/fire/firestore';
import { BehaviorSubject, map, Observable, Subscription } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

export interface AppointmentDetails {
  address: string;
  amount: number;
  appointment: string;
  appointmentDate: Date;
  appointmentDuration: number;
  appointmentStartHour: number;
  email: string;
  firstName: string;
  gender: string;
  lastName: string;
  localGovernment: string;
  location: string;
  paymentReference: string;
  phone: string;
  phoneType: string;
  teamA: string;
  teamB: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private firestore = inject(Firestore);
  private unsub: Subscription | null = null;

  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoadingSubject.asObservable();

  userSubject = new BehaviorSubject<AppointmentDetails[]>([]);
  users$ = this.userSubject.asObservable();

  // Filtered observable for today's matches
  todayUsers$: Observable<AppointmentDetails[]> = this.users$.pipe(
    map((users) =>
      users.filter((user) => {
        try {
          const appointmentDate = user.appointmentDate;
          if (isNaN(appointmentDate.getTime())) return false;
          const today = new Date();
          const todayString = today.toISOString().split('T')[0];
          const appointmentDateString = appointmentDate.toISOString().split('T')[0];
          return appointmentDateString === todayString;
        } catch {
          return false;
        }
      })
    )
  );

  // Filtered observable for upcoming matches (today and future)
  futureUsers$: Observable<AppointmentDetails[]> = this.users$.pipe(
    map((users) =>
      users.filter((user) => {
        try {
          const appointmentDate = user.appointmentDate;
          if (isNaN(appointmentDate.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Start of today
          return appointmentDate >= today;
        } catch {
          return false;
        }
      })
    )
  );

  constructor() {
    this.isLoadingSubject.next(true);

    const userCollection = collection(this.firestore, 'bookings');

    this.unsub = collectionData(userCollection, { idField: 'id' })
      .pipe(
        map((data) =>
          (data as AppointmentDetails[]).map((item) => ({
            ...item,
            appointmentDate:
              item.appointmentDate instanceof Timestamp
                ? item.appointmentDate.toDate()
                : new Date(item.appointmentDate),
          }))
        )
      )
      .subscribe(
        (staff: AppointmentDetails[]) => {
          this.userSubject.next(staff);
          this.isLoadingSubject.next(false);
        },
        (error: any) => {
          console.error('Error fetching staff:', error);
          this.isLoadingSubject.next(false);
        }
      );
  }

  getStaffCount(): Observable<number> {
    return this.users$.pipe(map((staff) => staff.length));
  }

  ngOnDestroy(): void {
    if (this.unsub) {
      this.unsub.unsubscribe();
    }
  }
}
