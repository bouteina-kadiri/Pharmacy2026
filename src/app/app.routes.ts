import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { LoginComponent } from './components/log-in/log-in.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },  // Default homepage
  { path: 'home', component: HomeComponent }, // "/home" route
   { path: 'login', component: LoginComponent }, // Log In route
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }  // Redirect invalid routes to home
];
