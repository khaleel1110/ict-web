import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Issue } from '../models/issue.model';

const STORAGE_KEY = 'ict_support_issues';

/**
 * IssueService — in-browser data layer for the ICT Support system.
 *
 * This currently persists to localStorage so the app is fully workable
 * on its own. When the real backend (Firestore/Node API per the project
 * background) is ready, swap the body of these methods for HttpClient /
 * AngularFire calls — the public method signatures can stay the same,
 * so components using this service won't need to change.
 */
@Injectable({ providedIn: 'root' })
export class IssueService {
  private issuesSubject = new BehaviorSubject<Issue[]>(this.loadFromStorage());
  issues$: Observable<Issue[]> = this.issuesSubject.asObservable();

  private loadFromStorage(): Issue[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(issues: Issue[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
    this.issuesSubject.next(issues);
  }

  getAll(): Issue[] {
    return this.issuesSubject.value;
  }

  getById(id: string): Issue | undefined {
    return this.issuesSubject.value.find((i) => i.id === id);
  }

  getByTicketId(ticketId: string): Issue | undefined {
    return this.issuesSubject.value.find(
      (i) => i.ticketId.toLowerCase() === ticketId.trim().toLowerCase()
    );
  }

  create(
    data: Omit<Issue, 'id' | 'ticketId' | 'status' | 'dateReported' | 'dateUpdated'>
  ): Issue {
    const issues = this.issuesSubject.value;
    const now = new Date().toISOString();
    const nextNumber = issues.length + 1;

    const newIssue: Issue = {
      ...data,
      id: this.generateId(),
      ticketId: `ICT-${String(nextNumber).padStart(4, '0')}`,
      status: 'Open',
      dateReported: now,
      dateUpdated: now,
    };

    this.saveToStorage([newIssue, ...issues]);
    return newIssue;
  }

  update(id: string, changes: Partial<Issue>): void {
    const issues = this.issuesSubject.value.map((i) =>
      i.id === id ? { ...i, ...changes, dateUpdated: new Date().toISOString() } : i
    );
    this.saveToStorage(issues);
  }

  delete(id: string): void {
    this.saveToStorage(this.issuesSubject.value.filter((i) => i.id !== id));
  }

  private generateId(): string {
    return typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}
