import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Lot } from '../models/lot.model';
import { Race } from '../models/race.model';

@Injectable({
  providedIn: 'root'
})
export class LotService {

  // L'adresse de ton serveur Node.js
  private apiUrl = 'http://localhost:3000/api';

  // Angular nous donne HttpClient automatiquement (injection)
  constructor(private http: HttpClient) {
    console.log('LotService créé avec apiUrl:', this.apiUrl);
  }

  // Cette fonction retourne un Observable (= données qui arrivent plus tard)
  getLots(): Observable<any> {
    console.log('LotService.getLots() appelé, URL:', `${this.apiUrl}/lots`);
    return this.http.get(`${this.apiUrl}/lots`);
  }

  // Récupérer un lot par ID
  getLot(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/lots/${id}`);
  }

  // Recuperer la race 
  getRaces(): Observable<any> {
    return this.http.get(`${this.apiUrl}/races`);
  }

  updateLot(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/lots/${id}`, data);
  }

  createLot(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/lots`, data);
  }

  deleteLot(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/lots/${id}`);
  }

}