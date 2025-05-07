import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'ai-ecosystems', loadComponent: () => import('./ai-ecosystems/ai-ecosystems.component').then(m => m.AiEcosystemsComponent) },
  { path: 'ai-ecosystems/lab', loadComponent: () => import('./ai-lab/ai-lab.component').then(m => m.AiLabComponent) },
  { path: 'ai-ecosystems/models', loadComponent: () => import('./ai-models/ai-models.component').then(m => m.AiModelsComponent) },
  { path: 'ai-ecosystems/quantization', loadComponent: () => import('./model-quantization/model-quantization.component').then(m => m.ModelQuantizationComponent) },
  { path: 'ai-ecosystems/protocols', loadComponent: () => import('./protocols/protocols.component').then(m => m.ProtocolsComponent) },
  { path: 'knowledge', loadComponent: () => import('./knowledge/knowledge.component').then(m => m.KnowledgeComponent) },
  { path: 'blockchain', loadComponent: () => import('./blockchain/blockchain.component').then(m => m.BlockchainComponent) },
  { path: 'blockchain/wallets', loadComponent: () => import('./blockchain-wallets/blockchain-wallets.component').then(m => m.BlockchainWalletsComponent) },
  { path: 'blockchain/contracts', loadComponent: () => import('./smart-contracts/smart-contracts.component').then(m => m.SmartContractsComponent) },
  { path: 'projects', loadComponent: () => import('./projects/projects.component').then(m => m.ProjectsComponent) },
  { path: 'projects/create', loadComponent: () => import('./projects-create/projects-create.component').then(m => m.ProjectsCreateComponent) },
  { path: 'projects/templates', loadComponent: () => import('./projects-templates/projects-templates.component').then(m => m.ProjectsTemplatesComponent) },
  { path: 'research', loadComponent: () => import('./research/research.component').then(m => m.ResearchComponent) },
  { path: 'system', loadComponent: () => import('./system/system.component').then(m => m.SystemComponent) },
  { path: 'servers', loadComponent: () => import('./servers/servers.component').then(m => m.ServersComponent) },
  { path: 'applications', loadComponent: () => import('./applications/applications.component').then(m => m.ApplicationsComponent) },
  { path: 'applications/meteor', loadComponent: () => import('./meteor-editor/meteor-editor.component').then(m => m.MeteorEditorComponent) },
  { path: 'applications/oracle', loadComponent: () => import('./oracle-cli/oracle-cli.component').then(m => m.OracleCliComponent) },
  { path: 'applications/calendar', loadComponent: () => import('./temporal-calendar/temporal-calendar.component').then(m => m.TemporalCalendarComponent) },
  { path: 'quantum', loadComponent: () => import('./quantum/quantum.component').then(m => m.QuantumComponent) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
