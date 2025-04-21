import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unit } from '../interfaces/unit.interface';

@Injectable({
  providedIn: 'root'
})
export class UnitService {
  private apiUrl = '/api/unit';

  constructor(private http: HttpClient) {}

  getAllUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(this.apiUrl);
  }

  addUnit(unit: Unit): Observable<Unit> {
    return this.http.post<Unit>(this.apiUrl, unit);
  }

  updateUnit(unit: Unit): Observable<Unit> {
    return this.http.put<Unit>(this.apiUrl, unit);
  }

  deleteUnit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
