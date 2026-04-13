import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  rememberMe = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      console.log('Por favor completa todos los campos');
      return;
    }
    
    // Llamar al servicio de autenticación
    this.authService.login(this.email, this.password).subscribe({
      next: (success) => {
        if (success) {
          // Redirigir a home después del login exitoso
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'No se pudo iniciar sesión. Revisa correo y contraseña.';
        alert(msg);
      }
    });
  }
}
