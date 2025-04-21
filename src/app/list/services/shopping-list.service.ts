import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShoppingListRequestDTO, ShoppingListResponseDTO } from '../interfaces/shopping-list.interface';

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiUrl = '/api/lists';

  constructor(private http: HttpClient) {}

  getAllLists(): Observable<ShoppingListResponseDTO[]> {
    return this.http.get<ShoppingListResponseDTO[]>(this.apiUrl);
  }

  createList(list: ShoppingListRequestDTO): Observable<ShoppingListResponseDTO> {
    return this.http.post<ShoppingListResponseDTO>(this.apiUrl, list);
  }

  updateList(list: ShoppingListRequestDTO): Observable<ShoppingListResponseDTO> {
    return this.http.put<ShoppingListResponseDTO>(`${this.apiUrl}`, list);
  }

  deleteList(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
