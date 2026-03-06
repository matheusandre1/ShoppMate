import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import {
  ItemResponseDTO,
  ItemRequestDTO,
} from '../../interfaces/item.interface';
import { Category } from '../../interfaces/category.interface';
import { Unit } from '../../interfaces/unit.interface';
import { ItemService } from '../../services/item.service';
import { CategoryService } from '../../services/category.service';
import { UnitService } from '../../services/unit.service';
import { forkJoin } from 'rxjs';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  standalone: true,
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSelectModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent implements OnInit {
  items: ItemResponseDTO[] = [];
  categories: Category[] = [];
  units: Unit[] = [];
  isLoading = false;
  itemForm: FormGroup;
  editingItemId: number | null = null;

  private confirmDialog = inject(ConfirmDialogService);
  private feedback = inject(FeedbackService);

  constructor(
    private itemService: ItemService,
    private categoryService: CategoryService,
    private unitService: UnitService,
    private fb: FormBuilder,
  ) {
    this.itemForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      idCategory: ['', Validators.required],
      idUnit: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.isLoading = true;
    forkJoin({
      items: this.itemService.getAllItems(),
      categories: this.categoryService.getAllCategories(),
      units: this.unitService.getAllUnits(),
    }).subscribe({
      next: (data) => {
        this.items = data.items;
        this.categories = data.categories;
        this.units = data.units;
        this.isLoading = false;
      },
      error: () => {
        this.feedback.error('Erro ao carregar dados');
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.itemForm.invalid) return;

    const itemData: ItemRequestDTO = {
      name: this.itemForm.value.name,
      idCategory: this.itemForm.value.idCategory,
      idUnit: this.itemForm.value.idUnit,
    };

    const operation = this.editingItemId
      ? this.itemService.updateItem(this.editingItemId, itemData)
      : this.itemService.addItem(itemData);

    operation.subscribe({
      next: () => {
        this.feedback.success(
          this.editingItemId
            ? 'Item atualizado com sucesso'
            : 'Item criado com sucesso',
        );
        this.resetForm();
        this.loadInitialData();
      },
      error: () => {
        this.feedback.error('Erro ao salvar item');
      },
    });
  }

  startEdit(item: ItemResponseDTO): void {
    this.editingItemId = item.id;
    this.itemForm.patchValue({
      name: item.name,
      idCategory: item.category.id,
      idUnit: item.unit.id,
    });
  }

  deleteItem(id: number): void {
    this.confirmDialog
      .open({
        title: 'Excluir item',
        message: 'Tem certeza que deseja excluir este item?',
        confirmText: 'Excluir',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.itemService.deleteItem(id).subscribe({
          next: () => {
            this.feedback.success('Item excluido com sucesso');
            this.loadInitialData();
          },
          error: () => {
            this.feedback.error('Erro ao excluir item');
          },
        });
      });
  }

  resetForm(): void {
    this.itemForm.reset();
    this.editingItemId = null;
  }
}
