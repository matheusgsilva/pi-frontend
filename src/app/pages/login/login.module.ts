import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { LoginComponent } from './login.component';
import { LoginRoutingModule } from './login.routing.module';
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DialogModule,
    InputTextModule,
    CardModule,
    LoginRoutingModule,
    ButtonModule
  ],
  declarations: [
    LoginComponent
  ],
})
export class LoginModule {}
