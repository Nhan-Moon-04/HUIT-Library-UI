import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent
      ),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then((m) => m.ProfileComponent),
  },
  {
    path: 'change-password',
    loadComponent: () =>
      import('./components/change-password/change-password.component').then(
        (m) => m.ChangePasswordComponent
      ),
  },
  {
    path: 'booking/create',
    loadComponent: () =>
      import('./components/booking-request/booking-request.component').then(
        (m) => m.BookingRequestComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'booking-request',
    redirectTo: 'booking/create',
    pathMatch: 'full',
  },
  {
    path: 'bookings',
    loadComponent: () =>
      import('./components/booking-list/booking-list.component').then(
        (m) => m.BookingListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'bookings/history',
    loadComponent: () =>
      import('./components/booking-history/booking-history.component').then(
        (m) => m.BookingHistoryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'booking-history',
    loadComponent: () =>
      import('./components/booking-history/booking-history.component').then(
        (m) => m.BookingHistoryComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'chat',
    loadComponent: () => import('./components/chat/chat.component').then((m) => m.ChatComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'loans',
    redirectTo: 'bookings',
    pathMatch: 'full',
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./components/notification-list/notification-list.component').then(
        (m) => m.NotificationListComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'notifications/:id',
    loadComponent: () =>
      import('./components/notification-detail/notification-detail.component').then(
        (m) => m.NotificationDetailComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'student-dashboard',
    loadComponent: () =>
      import('./components/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'staff-dashboard',
    loadComponent: () =>
      import('./components/staff-dashboard/staff-dashboard.component').then(
        (m) => m.StaffDashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./components/admin-dashboard/admin-dashboard.component').then(
        (m) => m.AdminDashboardComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'regulations',
    loadComponent: () =>
      import('./components/regulations/regulations.component').then(
        (m) => m.LibraryRegulationsComponent
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'room-search',
    loadComponent: () =>
      import('./components/room-search/room-search.component').then((m) => m.RoomSearchComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
