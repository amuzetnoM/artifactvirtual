import { Component } from '@angular/core';
// RouterOutlet will be available via RouterModule imported in AppModule

@Component({
  selector: 'app-root',
  // imports: [RouterOutlet], // Removed as RouterModule provides this via AppModule
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dashboard35';
}
