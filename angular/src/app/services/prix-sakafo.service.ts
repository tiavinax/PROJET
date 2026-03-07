import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrixSakafoService {

  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prix-sakafo`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prix-sakafo`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/prix-sakafo/${id}`, data);
  }
}