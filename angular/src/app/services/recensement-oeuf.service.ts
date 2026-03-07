import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecensementOeufService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(lotId?: number): Observable<any> {
    const url = lotId
      ? `${this.apiUrl}/recensement-oeuf?lot_id=${lotId}`
      : `${this.apiUrl}/recensement-oeuf`;
    return this.http.get(url);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/recensement-oeuf/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/recensement-oeuf`, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/recensement-oeuf/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/recensement-oeuf/${id}`);
  }
}