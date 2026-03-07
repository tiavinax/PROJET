import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SituationService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getSituation(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/situation?date=${date}`);
  }
}