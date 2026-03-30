import { Component } from '@angular/core';
import { User } from '../../../service/user/user';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './otp.html',
  styleUrl: './otp.css'
})
export class Otp {


  otpForm: FormGroup;

  loginUser: any = {
    otp: '',
    email: ''
  }



  constructor(private user: User, private router: Router, private fb: FormBuilder) {
    this.loginUser.email = localStorage.getItem('userEmail') || '';

    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(6)]]
    });

  }



  verifyOtp() {
    const otpInputs = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;
    const otpValue = Array.from(otpInputs).map(input => input.value).join('');
     this.loginUser.otp = otpValue;


    this.user.verifyOtp(this.loginUser).subscribe(
      (response: any) => {
        alert(response.message);

        localStorage.setItem('token', response.token.token);
        localStorage.setItem('userid', response.userid);

        const roleId = response.token.roleId;
        localStorage.setItem('roleId', roleId);

        // Fetch role permissions and store them
        this.user.getRoleById(roleId).subscribe(
          (roleData: any) => {
            // Store permissions as JSON string
            localStorage.setItem('permissions', JSON.stringify(roleData.assignPermissions));
            this.router.navigate(['/dashboard']);
          },
          (error: any) => {
            console.error('Failed to fetch role permissions', error);
            // Navigate anyway, handle missing permissions in navbar
            this.router.navigate(['/dashboard']);
          }
        );
      },
      (error: any) => {
        alert(error);
      }
    );
  }


  moveFocus(event: any, index: number) {
    const inputElements = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;

    if (event.target.value && index < inputElements.length - 1) {
      inputElements[index + 1].focus(); // Move to next input
    }
  }

  handleBackspace(event: any, index: number) {
    const inputElements = document.querySelectorAll('.otp-box') as NodeListOf<HTMLInputElement>;

    if (event.key === "Backspace" && !event.target.value && index > 0) {
      inputElements[index - 1].focus(); // Move to previous input on backspace
    }
  }


}












