import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';

// Material UI Components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSliderModule } from '@angular/material/slider';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DragDropModule } from '@angular/cdk/drag-drop';

// Third-party libraries
import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';

// Application components
import { AppComponent } from './app.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';
import { AiAssistantComponent } from './components/ai-assistant/ai-assistant.component';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { CompilationOutputComponent } from './components/compilation-output/compilation-output.component';
import { FileExplorerComponent } from './components/file-explorer/file-explorer.component';
import { TestDashboardComponent } from './components/test-dashboard/test-dashboard.component';

// Application services
import { AiService } from './services/ai.service';
import { FileSystemService } from './services/file-system.service';
import { CompilationService } from './services/compilation.service';
import { ThemeService } from './services/theme.service';

@NgModule({
  declarations: [
    AppComponent,
    CodeEditorComponent,
    AiAssistantComponent,
    LandingPageComponent,
    HeaderComponent,
    FooterComponent,
    CompilationOutputComponent,
    FileExplorerComponent,
    TestDashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    AppRoutingModule,
    
    // Material modules
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSliderModule,
    MatCardModule,
    MatTabsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ClipboardModule,
    DragDropModule,
    
    // Third-party modules
    HighlightModule
  ],
  providers: [
    AiService,
    FileSystemService,
    CompilationService,
    ThemeService,
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        coreLibraryLoader: () => import('highlight.js/lib/core'),
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          javascript: () => import('highlight.js/lib/languages/javascript'),
          solidity: () => import('highlightjs-solidity'),
          json: () => import('highlight.js/lib/languages/json')
        },
        themePath: 'assets/styles/github-dark.css'
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }