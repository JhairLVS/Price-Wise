import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showLoginForm() {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    if (registerForm) registerForm.classList.add('hidden');
    if (loginForm) loginForm.classList.remove('hidden');
  }

  showRegisterForm() {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.classList.add('hidden');
    if (registerForm) registerForm.classList.remove('hidden');
  }

  login() {
    const loginForm = document.getElementById('login-form');
    const mainApp = document.getElementById('main-app');
    if (loginForm) loginForm.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');
  }

  searchProducts(event: Event) {
    event.preventDefault();
    const queryInput = document.getElementById('query') as HTMLInputElement;
    const query = queryInput?.value;
  }

  showDetails(title: string, link: string, image: string, price: string, store: string, query: string) {
  }
}
