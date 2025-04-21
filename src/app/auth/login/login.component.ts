import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HttpClient, provideHttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, finalize, tap, throwError, of } from 'rxjs';

interface LoginResponse {
  token: string;
  // user: {
  //   id: number;
  //   name: string;
  //   email: string;
  // };
}

@Component({
  standalone: true,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {

    this.loginForm.markAllAsTouched();


    if (this.loginForm.invalid) {
      this.errorMessage = 'Por favor, preencha os campos corretamente.'
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    const credentials = this.loginForm.value;

    this.http.post<LoginResponse>(this.apiUrl, credentials)
    .pipe(
      tap((response) => {
        localStorage.setItem('token', response.token);
        //localStorage.setItem('user', JSON.stringify(response.user));
        console.log('Token saved to localStorage');

        this.router.navigate(['/home']);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login failed', error);

        if (error.status === 401 || error.status === 400) {
          this.errorMessage = 'Credenciais inválidas.';
        } else {
          this.errorMessage = 'Ocorreu um erro durante o login. Tente novamente mais tarde';
        }

        return of(null);
      }),
      finalize(()=> {
        this.isLoading = false;
      })
    )
    .subscribe();
  }
}
