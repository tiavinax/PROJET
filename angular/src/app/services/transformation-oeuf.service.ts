import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransformationOeufService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getAll(): Observable<any> {
    return this.http.get(`${this.apiUrl}/transformation-oeuf`);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/transformation-oeuf/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transformation-oeuf`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/transformation-oeuf/${id}`);
  }
}