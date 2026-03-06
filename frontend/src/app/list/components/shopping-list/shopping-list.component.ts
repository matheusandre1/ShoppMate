import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ShoppingListService } from '../../../shared/services/shopping-list.service';
import { ShoppingListResponseDTO } from '../../../shared/interfaces/shopping-list.interface';
import { ShoppingListDialogComponent } from '../shopping-list-dialog/shopping-list-dialog.component';
import { ListShareDialogComponent } from '../list-share-dialog/list-share-dialog.component';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-shopping-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShoppingListComponent implements OnInit {
  shoppingLists: ShoppingListResponseDTO[] = [];
  isLoading = false;

  constructor(
    private shoppingListService: ShoppingListService,
    private dialog: MatDialog,
    private confirmDialog: ConfirmDialogService,
    private feedback: FeedbackService,
  ) {}

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
    this.isLoading = true;
    this.shoppingListService.getAllShoppingLists().subscribe({
      next: (lists) => {
        this.shoppingLists = lists;
        this.isLoading = false;
      },
      error: () => {
        this.feedback.error('Erro ao carregar listas');
        this.isLoading = false;
      },
    });
  }

  openEditDialog(list: ShoppingListResponseDTO): void {
    const dialogRef = this.dialog.open(ShoppingListDialogComponent, {
      width: '400px',
      data: { list, isEdit: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLists();
      }
    });
  }

  openNewListDialog(): void {
    const dialogRef = this.dialog.open(ShoppingListDialogComponent, {
      width: '400px',
      data: { isEdit: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadLists();
      }
    });
  }

  deleteList(id: number): void {
    this.confirmDialog
      .open({
        title: 'Excluir lista',
        message: 'Tem certeza que deseja excluir esta lista?',
        confirmText: 'Excluir',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.shoppingListService.deleteShoppingList(id).subscribe({
          next: () => {
            this.feedback.success('Lista excluida com sucesso');
            this.loadLists();
          },
          error: () => {
            this.feedback.error('Erro ao excluir lista');
          },
        });
      });
  }

  openShareDialog(list: ShoppingListResponseDTO): void {
    this.dialog.open(ListShareDialogComponent, {
      width: '600px',
      data: { listId: list.idList, listName: list.listName },
    });
  }
}
