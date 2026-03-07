import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MortaliteService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(lotId?: number): Observable<any> {
    const url = lotId
      ? `${this.apiUrl}/mortalite?lot_id=${lotId}`
      : `${this.apiUrl}/mortalite`;
    return this.http.get(url);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/mortalite/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/mortalite`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/mortalite/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/mortalite/${id}`);
  }
}