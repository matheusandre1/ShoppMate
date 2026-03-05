import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ShoppingListRequestDTO } from '../../../../shared/interfaces/shopping-list.interface';

@Component({
  selector: 'app-list-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './list-dialog.component.html',
  styleUrls: ['./list-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDialogComponent {
  public dialogRef = inject(MatDialogRef<ListDialogComponent>);
  public data = inject(MAT_DIALOG_DATA) as { list?: ShoppingListRequestDTO };

  list: ShoppingListRequestDTO = this.data.list
    ? { ...this.data.list }
    : {
        name: '',
        idUser: 0,
      };

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.list);
  }
}
