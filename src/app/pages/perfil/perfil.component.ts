import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="perfil-container">
      <div class="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Información de tu cuenta de administrador</p>
      </div>

      <div class="perfil-content">
        <div class="perfil-card">
          <div class="avatar-section">
            <div class="avatar">👤</div>
            <h2>Administrador</h2>
            <p class="email">admin&#64;activa.com</p>
          </div>

          <div class="info-section">
            <div class="info-group">
              <label>Rol:</label>
              <p>Administrador del Sistema</p>
            </div>
            <div class="info-group">
              <label>Estado:</label>
              <p class="status active">Activo</p>
            </div>
            <div class="info-group">
              <label>Última sesión:</label>
              <p>Hoy a las 14:30</p>
            </div>
          </div>

          <div class="button-group">
            <button class="btn btn-primary">Editar Perfil</button>
            <button class="btn btn-secondary">Cambiar Contraseña</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .perfil-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }

    .perfil-header {
      margin-bottom: 32px;
    }

    .perfil-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      color: #0E2940;
    }

    .perfil-header p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .perfil-content {
      display: flex;
      justify-content: center;
    }

    .perfil-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      padding: 32px;
      width: 100%;
      max-width: 600px;
    }

    .avatar-section {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid #E5E7EB;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(145deg, #21BFBF 0%, #153959 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
      margin: 0 auto 16px;
    }

    .avatar-section h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      color: #0E2940;
    }

    .email {
      margin: 0;
      color: #21BFBF;
      font-size: 14px;
    }

    .info-section {
      margin-bottom: 32px;
    }

    .info-group {
      margin-bottom: 20px;
    }

    .info-group label {
      display: block;
      font-weight: 600;
      color: #0E2940;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .info-group p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }

    .status.active {
      background: rgba(39, 174, 96, 0.1);
      color: #27AE60;
    }

    .button-group {
      display: flex;
      gap: 12px;
      justify-content: center;
    }

    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(145deg, #21BFBF 0%, #153959 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(33, 191, 191, 0.3);
    }

    .btn-secondary {
      background: #F2F2F2;
      color: #0E2940;
      border: 1px solid #E5E7EB;
    }

    .btn-secondary:hover {
      background: #E5E7EB;
    }
  `]
})
export class PerfilComponent {}
