import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ItemRequestDTO, ItemResponseDTO } from '../interfaces/item.interface';

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = '/api/item';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<ItemResponseDTO[]> {
    return this.http.get<ItemResponseDTO[]>(this.apiUrl);
  }

  getItemById(id: number): Observable<ItemResponseDTO> {
    return this.http.get<ItemResponseDTO>(`${this.apiUrl}/${id}`);
  }

  addItem(item: ItemRequestDTO): Observable<ItemResponseDTO> {
    return this.http.post<ItemResponseDTO>(this.apiUrl, item);
  }

  updateItem(id: number, item: ItemRequestDTO): Observable<ItemResponseDTO> {
    return this.http.put<ItemResponseDTO>(`${this.apiUrl}/${id}`, item);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
