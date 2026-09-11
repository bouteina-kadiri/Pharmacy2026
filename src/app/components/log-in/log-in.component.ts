import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(private dataService: DataService) {}

  loginUser() {
    const user = { username: this.username, password: this.password };
    this.dataService.loginUser(user).subscribe(
      (response) => {
        alert('Login Successful!');
        console.log(response);
      },
      (error) => {
        alert('Invalid Credentials!');
        console.error(error);
      }
    );
  }
}

