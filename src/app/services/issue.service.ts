import {Injectable, inject} from '@angular/core';

import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  orderBy,
  query,
} from '@angular/fire/firestore';

import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

import {Issue} from '../models/issue.model';

/**
 * Firestore collection used by the ICT support system.
 *
 * All reported complaints/issues are stored here:
 *
 * report-issue/
 *   ICT-0001-ab12
 *   ICT-0002-cd34
 *   ...
 */
const COLLECTION = 'report-issue';

/**
 * Counter used to generate ticket numbers.
 *
 * counters/report-issue
 */
const COUNTER_DOC = 'counters/report-issue';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  private readonly firestore = inject(Firestore);

  private readonly issuesCollection = collection(
    this.firestore,
    COLLECTION
  );

  private subscription?: Subscription;

  // ---------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------

  private readonly loadingSubject =
    new BehaviorSubject<boolean>(true);

  readonly isLoading$ =
    this.loadingSubject.asObservable();

  // ---------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------

  private readonly errorSubject =
    new BehaviorSubject<string | null>(null);

  readonly error$ =
    this.errorSubject.asObservable();

  // ---------------------------------------------------------
  // ISSUES DATA
  // ---------------------------------------------------------

  private readonly issuesSubject =
    new BehaviorSubject<Issue[]>([]);

  readonly issues$ =
    this.issuesSubject.asObservable();

  // ---------------------------------------------------------
  // CONSTRUCTOR
  // ---------------------------------------------------------

  constructor() {
    this.loadIssues();
  }

  // =========================================================
  // LOAD ALL ISSUES
  // =========================================================

  private loadIssues(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    const issuesQuery = query(
      this.issuesCollection,
      orderBy('dateReported', 'desc')
    );

    this.subscription = collectionData(issuesQuery, {
      idField: 'id',
    })
      .pipe(
        map((items) => items as Issue[])
      )
      .subscribe({
        next: (issues) => {
          this.issuesSubject.next(issues);
          this.loadingSubject.next(false);

          console.log(
            `Loaded ${issues.length} issues from Firestore collection "${COLLECTION}".`
          );
        },

        error: (error) => {
          console.error(
            `Error loading Firestore collection "${COLLECTION}":`,
            error
          );

          this.loadingSubject.next(false);

          this.errorSubject.next(
            'Unable to load reported issues from Firestore.'
          );
        },
      });
  }

  // =========================================================
  // GET ONE ISSUE
  // =========================================================

  async getById(
    id: string
  ): Promise<Issue | undefined> {
    if (!id) {
      return undefined;
    }

    try {
      const issueRef = doc(
        this.firestore,
        COLLECTION,
        id
      );

      const snap = await getDoc(issueRef);

      if (!snap.exists()) {
        return undefined;
      }

      return {
        id: snap.id,
        ...snap.data(),
      } as Issue;
    } catch (error) {
      console.error(
        'Error getting issue:',
        error
      );

      throw error;
    }
  }

  // =========================================================
  // GET ISSUE BY TICKET ID
  // =========================================================

  async getByTicketId(
    ticketId: string
  ): Promise<Issue | undefined> {
    return this.getById(ticketId.trim());
  }

  // =========================================================
  // CREATE ISSUE
  // =========================================================

  async create(
    data: Omit<
      Issue,
      | 'id'
      | 'ticketId'
      | 'status'
      | 'dateReported'
      | 'dateUpdated'
    >
  ): Promise<Issue> {

    this.errorSubject.next(null);

    try {
      // Generate ticket number
      const ticketId =
        await this.generateTicketId();

      const now =
        new Date().toISOString();

      const issueData: Omit<Issue, 'id'> = {
        ...data,

        ticketId,

        status: 'Open',

        dateReported: now,

        dateUpdated: now,
      };

      // -----------------------------------------------------
      // IMPORTANT:
      // Ticket ID is also the Firestore document ID.
      //
      // report-issue/ICT-0001-ab12
      // -----------------------------------------------------

      const issueRef = doc(
        this.firestore,
        COLLECTION,
        ticketId
      );

      await setDoc(
        issueRef,
        issueData
      );

      const createdIssue: Issue = {
        id: ticketId,
        ...issueData,
      };

      // Update local observable immediately
      // so the admin UI doesn't need to wait for
      // another page refresh.
      this.issuesSubject.next([
        createdIssue,
        ...this.issuesSubject.value,
      ]);

      console.log(
        'Issue successfully created:',
        createdIssue
      );

      return createdIssue;

    } catch (error) {

      console.error(
        'Failed to create issue:',
        error
      );

      this.errorSubject.next(
        'Failed to submit the issue to Firestore.'
      );

      throw error;
    }
  }

  // =========================================================
  // UPDATE ISSUE
  // =========================================================

  async update(
    id: string,
    changes: Partial<Issue>
  ): Promise<void> {

    if (!id) {
      throw new Error(
        'Issue ID is required.'
      );
    }

    try {

      const issueRef = doc(
        this.firestore,
        COLLECTION,
        id
      );

      await updateDoc(
        issueRef,
        {
          ...changes,
          dateUpdated:
            new Date().toISOString(),
        }
      );

      console.log(
        `Issue ${id} updated successfully.`
      );

    } catch (error) {

      console.error(
        `Failed to update issue ${id}:`,
        error
      );

      throw error;
    }
  }

  // =========================================================
  // DELETE ISSUE
  // =========================================================

  async delete(
    id: string
  ): Promise<void> {

    if (!id) {
      return;
    }

    try {

      const issueRef = doc(
        this.firestore,
        COLLECTION,
        id
      );

      await deleteDoc(issueRef);

      // Remove immediately from local state
      this.issuesSubject.next(
        this.issuesSubject.value.filter(
          (issue) => issue.id !== id
        )
      );

      console.log(
        `Issue ${id} deleted successfully.`
      );

    } catch (error) {

      console.error(
        `Failed to delete issue ${id}:`,
        error
      );

      throw error;
    }
  }

  // =========================================================
  // GET ALL
  // =========================================================

  getAll(): Observable<Issue[]> {
    return this.issues$;
  }

  // =========================================================
  // GET COUNT
  // =========================================================

  getCount(): Observable<number> {
    return this.issues$.pipe(
      map(
        (issues) => issues.length
      )
    );
  }

  // =========================================================
  // GENERATE TICKET ID
  // =========================================================

  private async generateTicketId(): Promise<string> {

    const counterRef = doc(
      this.firestore,
      COUNTER_DOC
    );

    const nextNumber =
      await runTransaction(
        this.firestore,
        async (transaction) => {

          const snapshot =
            await transaction.get(
              counterRef
            );

          const current =
            snapshot.exists()
              ? Number(
                snapshot.data()['count'] ?? 0
              )
              : 0;

          const next =
            current + 1;

          transaction.set(
            counterRef,
            {
              count: next,
              updatedAt:
                new Date().toISOString(),
            },
            {
              merge: true,
            }
          );

          return next;
        }
      );

    const suffix =
      Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

    return `ICT-${String(nextNumber).padStart(
      4,
      '0'
    )}-${suffix}`;
  }

  // =========================================================
  // CLEANUP
  // =========================================================

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
