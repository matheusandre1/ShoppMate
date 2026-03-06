import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe } from '@angular/common';

import { UnitService } from '../../../shared/services/unit.service';
import { Unit } from '../../../shared/interfaces/unit.interface';
import { finalize, catchError, of, tap, BehaviorSubject } from 'rxjs';
import { UnitDialogComponent } from './unit-dialog/unit-dialog.component';
import { ConfirmDialogService } from '../../../shared/services/confirm-dialog.service';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-units-management',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatCardModule,
    AsyncPipe,
  ],
  templateUrl: './units-management.component.html',
  styleUrls: ['./units-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitsManagementComponent implements OnInit {
  private unitService = inject(UnitService);
  private dialog = inject(MatDialog);
  private confirmDialog = inject(ConfirmDialogService);
  private feedback = inject(FeedbackService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  error = false;
  private unitsSubject = new BehaviorSubject<Unit[]>([]);
  units$ = this.unitsSubject.asObservable();
  displayedColumns: string[] = ['name', 'symbol', 'actions'];

  ngOnInit(): void {
    this.loadUnits();
  }

  loadUnits(): void {
    this.loading = true;
    this.error = false;

    this.unitService
      .getAllUnits()
      .pipe(
        tap((response) => {
          this.unitsSubject.next(response || []);
        }),
        catchError(() => {
          this.error = true;
          this.unitsSubject.next([]);
          this.feedback.error(
            'Erro ao carregar unidades. Tente novamente mais tarde.',
          );
          return of([]);
        }),
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe();
  }

  editUnit(unit: Unit): void {
    const dialogRef = this.dialog.open(UnitDialogComponent, {
      width: '400px',
      data: { unit },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.unitService.updateUnit(result).subscribe({
          next: () => {
            this.loadUnits();
            this.feedback.success('Unidade atualizada com sucesso');
          },
          error: () => {
            this.feedback.error('Erro ao atualizar unidade');
          },
        });
      }
    });
  }

  deleteUnit(unit: Unit): void {
    this.confirmDialog
      .open({
        title: 'Excluir unidade',
        message: `Tem certeza que deseja excluir a unidade "${unit.name}"?`,
        confirmText: 'Excluir',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;

        this.unitService.deleteUnit(unit.id!).subscribe({
          next: () => {
            this.loadUnits();
            this.feedback.success('Unidade excluida com sucesso');
          },
          error: () => {
            this.feedback.error('Erro ao excluir unidade');
          },
        });
      });
  }

  openNewUnitDialog(): void {
    const dialogRef = this.dialog.open(UnitDialogComponent, {
      width: '400px',
      data: { unit: null },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.unitService.addUnit(result).subscribe({
          next: () => {
            this.loadUnits();
            this.feedback.success('Unidade adicionada com sucesso');
          },
          error: () => {
            this.feedback.error('Erro ao adicionar unidade');
          },
        });
      }
    });
  }
}
