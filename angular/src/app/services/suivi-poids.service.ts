import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SuiviPoidsService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Tous les suivis — avec ou sans filtre lot
  getAll(raceId?: number): Observable<any> {
    const url = raceId
      ? `${this.apiUrl}/suivi-poids?race_id=${raceId}`
      : `${this.apiUrl}/suivi-poids`;
    return this.http.get(url);
  }
  // Par ID
  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/suivi-poids/${id}`);
  }

  // Créer
  create(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/suivi-poids`, data);
  }

  // Modifier
  update(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/suivi-poids/${id}`, data);
  }

  // Supprimer
  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/suivi-poids/${id}`);
  }
}