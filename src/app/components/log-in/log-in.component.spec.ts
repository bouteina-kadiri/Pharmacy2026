import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { LoginComponent } from './log-in.component';
import { DataService } from '../../services/data.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let service: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loginUser', 'signupUser', 'currentUser', 'logoutUser']);
    service.loginUser.and.returnValue(of({ user: { id: '1', name: 'Test', lastName: 'Client', email: 'person@example.com' } }));
    service.currentUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([]), { provide: DataService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  async function submit(email: string, password: string) {
    for (const [id, value] of [['email', email], ['password', password]]) {
      const input = fixture.nativeElement.querySelector('#' + id) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('blocks invalid credentials before calling the API', async () => {
    await submit('invalid-email', '');
    expect(service.loginUser).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#email-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#password-error')).toBeTruthy();
  });

  it('submits email and password and displays success', async () => {
    await submit('person@example.com', 'my-password');
    expect(service.loginUser).toHaveBeenCalledWith({ email: 'person@example.com', password: 'my-password' });
    expect(component.successMessage).toContain('successful');
    expect(component.password).toBe('');
  });

  it('blocks mismatched sign-up passwords', async () => {
    component.isSignup = true;
    component.name = 'Test';
    component.lastName = 'Client';
    component.confirmPassword = 'different password';
    fixture.detectChanges();
    await fixture.whenStable();
    await submit('person@example.com', 'a long password');
    expect(service.signupUser).not.toHaveBeenCalled();
    expect(component.errorMessage).toContain('do not match');
  });

  it('shows an inline error when credentials are rejected', async () => {
    service.loginUser.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    await submit('person@example.com', 'wrong-password');
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('incorrect');
    expect(component.isSubmitting).toBeFalse();
  });
});
