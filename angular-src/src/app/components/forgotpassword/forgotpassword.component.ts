import { Component, OnInit, ResolvedReflectiveFactory } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotpasswordComponent implements OnInit {
  email: String;

  constructor(
    private router: Router,
    private authService: AuthService

  ) { }

  ngOnInit() {
  }

  onforgotpasswordSubmit()
  {
    
   
      const user = {
        email: this.email
       
      }

  
      this.authService.forgotpasswordUser(user).subscribe(data => {
          if(data.success) {
          console.log("reset password");
          alert("reset password");
          } else {
         
            this.router.navigate(['login']);
          }
      });
    }

  }



