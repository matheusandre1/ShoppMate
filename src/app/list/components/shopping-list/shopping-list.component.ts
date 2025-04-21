import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ShoppingListService } from '../../services/shopping-list.service';
import { ShoppingListResponseDTO, ShoppingListRequestDTO } from '../../interfaces/shopping-list.interface';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  standalone: true,
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ]
})
export class ShoppingListComponent implements OnInit {
  lists: ShoppingListResponseDTO[] = [];
  isLoading = false;
  listForm: FormGroup;
  editingListId: number | null = null;

  constructor(
    private listService: ShoppingListService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.listForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.listService.getAllLists().subscribe({
      next: (lists) => {
        this.lists = lists;
        this.isLoading = false;
      },
      error: (error) => {
        this.snackBar.open('Erro ao carregar listas', 'Fechar', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.listForm.invalid) return;

    const listData: ShoppingListRequestDTO = {
      name: this.listForm.value.name,
      idUser: 1 // TODO: Get from authenticated user
    };

    const operation = this.editingListId
      ? this.listService.updateList({ ...listData, idUser: listData.idUser })
      : this.listService.createList(listData);

    operation.subscribe({
      next: () => {
        this.snackBar.open(
          this.editingListId ? 'Lista atualizada com sucesso' : 'Lista criada com sucesso',
          'Fechar',
          { duration: 3000 }
        );
        this.resetForm();
        this.loadLists();
      },
      error: (error) => {
        this.snackBar.open('Erro ao salvar lista', 'Fechar', { duration: 3000 });
      }
    });
  }

  startEdit(list: ShoppingListResponseDTO): void {
    this.editingListId = list.idList;
    this.listForm.patchValue({
      name: list.listName
    });
  }

  deleteList(id: number): void {
    if (confirm('Tem certeza que deseja excluir esta lista?')) {
      this.listService.deleteList(id).subscribe({
        next: () => {
          this.snackBar.open('Lista excluída com sucesso', 'Fechar', { duration: 3000 });
          this.loadLists();
        },
        error: (error) => {
          this.snackBar.open('Erro ao excluir lista', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.listForm.reset();
    this.editingListId = null;
  }
}
