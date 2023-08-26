import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_ENDPOINTS } from 'src/app/shared/api.urls';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }

  add(body: any) {
    return this.http.post(environment.url + API_ENDPOINTS.USER.ADD, body);
  }

  update(body: any, guid: string) {
    return this.http.put(environment.url + API_ENDPOINTS.USER.UPDATE + guid, body);
  }

  detail(guid: string) {
    return this.http.get(environment.url + API_ENDPOINTS.USER.DETAIL + guid);
  }

  delete(guid: string) {
    return this.http.delete(environment.url + API_ENDPOINTS.USER.DELETE + guid);
  }

  list() {
    return this.http.get(environment.url + API_ENDPOINTS.USER.LIST);
  }
}
