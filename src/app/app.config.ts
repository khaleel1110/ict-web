import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, connectFirestoreEmulator, provideFirestore } from '@angular/fire/firestore';
import { getAuth, connectAuthEmulator, provideAuth } from '@angular/fire/auth';
import { getFunctions, connectFunctionsEmulator, provideFunctions } from '@angular/fire/functions';
import { getStorage, connectStorageEmulator, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(),
    importProvidersFrom(ReactiveFormsModule),
    provideFirebaseApp(() => initializeApp(environment.firebaseApp)),
    provideAuth(() => {
      const auth = getAuth();
      if (environment.useEmulator) {
        connectAuthEmulator(auth, 'http://localhost:9099');
      }
      return auth;
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulator) {
        connectFirestoreEmulator(firestore, 'localhost', 8080);
      }
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulator) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulator) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    })
  ]
};
