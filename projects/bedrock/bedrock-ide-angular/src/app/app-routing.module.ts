import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { CodeEditorComponent } from './components/code-editor/code-editor.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'editor', component: CodeEditorComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }