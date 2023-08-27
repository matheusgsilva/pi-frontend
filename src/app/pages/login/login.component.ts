import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  displayDialog: boolean = false;
  messageDialogTitle: string = "";
  messageDialog: string = "";

  form = this.fb.group({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [Validators.required])
  });

  constructor(private fb: FormBuilder, private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
  }

  login() {
    this.loginService.login(this.form.getRawValue())
      .subscribe((response) => {
          localStorage["token"] = response.data.token;
          localStorage["email"] = response.data.email;
          localStorage["userGuid"] = response.data.userGuid;
          localStorage["userName"] = response.data.userName;
          this.router.navigate([""]);
      },
        error => {
          if (error.status == 401) {
            this.unauthorized();
          } else this.showDialog("Ocorreu um erro!", "Um erro ocorreu ao realizar a transação. Por favor, tente novamente.");
        });
  }

  unauthorized() {
    this.showDialog("Credenciais Inválidas!", "Usuários e/ou senhas inválidos! Verifique os dados inseridos.");
  }

  showDialog(title: string, msg: string) {
    this.messageDialogTitle = title;
    this.messageDialog = msg;
    this.displayDialog = true;
  }
}
