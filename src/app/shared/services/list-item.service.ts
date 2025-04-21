import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListItemRequestDTO, ListItemResponseDTO } from '../interfaces/list-item.interface';

@Injectable({
  providedIn: 'root'
})
export class ListItemService {
  private apiUrl = '/api/lists';

  constructor(private http: HttpClient) {}

  getAllListItems(listId: number): Observable<ListItemResponseDTO[]> {
    return this.http.get<ListItemResponseDTO[]>(`${this.apiUrl}/${listId}/items`);
  }

  getListItemById(listId: number, id: number): Observable<ListItemResponseDTO> {
    return this.http.get<ListItemResponseDTO>(`${this.apiUrl}/${listId}/items/${id}`);
  }

  addListItem(listItem: ListItemRequestDTO): Observable<ListItemResponseDTO> {
    return this.http.post<ListItemResponseDTO>(`${this.apiUrl}/${listItem.listId}/items`, listItem);
  }

  updateListItem(listId: number, id: number, listItem: ListItemRequestDTO): Observable<ListItemResponseDTO> {
    return this.http.put<ListItemResponseDTO>(`${this.apiUrl}/${listId}/items/${id}`, listItem);
  }

  deleteListItem(listId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${listId}/items/${id}`);
  }
}
