import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './components/log-in/log-in.component';
import { PrescriptionStatusComponent } from './components/prescription-status/prescription-status.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Default homepage
  { path: 'home', component: HomeComponent }, // "/home" route
  { path: 'signup', component: LoginComponent, data: { signup: true } },
  { path: 'login', component: LoginComponent }, // Log In route
  { path: 'prescription-status', component: PrescriptionStatusComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }  // Redirect invalid routes to home
];
