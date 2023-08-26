import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_ENDPOINTS } from 'src/app/shared/api.urls';
import { ResponseAPI } from 'src/app/shared/response.model';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private router: Router) { }

  login(body: any) {
    return this.http.post<ResponseAPI>(`${environment.url}${API_ENDPOINTS.LOGIN.LOGIN}`, body);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(["login"]);
  }

  getCredentials() {
    return localStorage.getItem('token') || false;
  }
}
