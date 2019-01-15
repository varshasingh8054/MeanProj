import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  password : String;
  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  onresetSubmit() {
    const user = {
      password: this.password
    }

    this.authService.updatePasswordUser(user).subscribe(data => {
        if(data.success) {
          this.authService.storeUserData(data.token, data.user);
          alert("Please login again");
          this.router.navigate(['login']);
        } else {
         alert("Reset password again");
          this.router.navigate(['reset-password']);
        }
    });
  }



}
