import { Component } from '@angular/core';
import { User } from '../../../service/user/user';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  users = {
    email: '',
    password: ''
  }


  constructor(private user: User, private router: Router) { }
  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
  requestOtp() {
    this.user.sendOtp(this.users).subscribe(
      (res: any) => {
        console.log('Login API Response:', res);

        localStorage.setItem('userEmail', this.users.email);

        // Check success condition from API
        if (res?.success === true || res?.status === 'OK' || res?.message?.includes('OTP')) {
          alert(res.message || 'OTP sent to email');
          this.router.navigate(['/otp']);
        } else {
          alert(res.message || 'Invalid username or password');
        }
      },
      (error) => {
        console.error('Login error:', error);

        if (error.error?.message) {
          alert(error.error.message);
        } else if (typeof error.error === 'string') {
          alert(error.error);
        } else {
          alert('Invalid username or password');
        }
      }
    );
  }


}
