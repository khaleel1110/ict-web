import { Routes } from '@angular/router';
import { ReportIssueComponent } from './report-issue/report-issue.component';
import { TrackStatusComponent } from './track-status/track-status.component';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { IssueListComponent } from './admin/issue-list/issue-list.component';
import { IssueFormComponent } from './admin/issue-form/issue-form.component';
import { adminGuard } from './guards/admin.guard';
import {HomeComponent} from './home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'report-issue', component: ReportIssueComponent },
  { path: 'track', component: TrackStatusComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/issues', component: IssueListComponent, canActivate: [adminGuard] },
  { path: 'admin/issues/new', component: IssueFormComponent, canActivate: [adminGuard] },
  { path: 'admin/issues/:id/edit', component: IssueFormComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' },
];
