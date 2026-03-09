import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PrixAtodyService {

  private apiUrl = 'http://localhost:3000/api';
  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prix-atody`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/prix-atody`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/prix-atody/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/prix-atody/${id}`);
  }
}