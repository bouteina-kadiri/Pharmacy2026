import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ContentComponent } from './components/content/content.component';
import { HomeComponent } from './components/home/home.component';

// Pages
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';

// Services
import { DataService } from './services/data.service';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    ContentComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule {}
