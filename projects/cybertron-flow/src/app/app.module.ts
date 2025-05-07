import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgxGraphModule } from '@swimlane/ngx-graph';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CybertronFlowComponent } from './cybertron-flow.component';
import { OrchestratorService } from './services/orchestrator.service';
import { LangchainService } from './services/langchain.service';
import { SchedulerService } from './services/scheduler.service';

// Node Settings Components
import { ChatNodeSettingsComponent } from './components/node-settings/chat-node-settings.component';
import { IntegrationNodeSettingsComponent } from './components/node-settings/integration-node-settings.component';
import { SchedulerNodeSettingsComponent } from './components/node-settings/scheduler-node-settings.component';
import { TaskNodeSettingsComponent } from './components/node-settings/task-node-settings.component';
import { ReportNodeSettingsComponent } from './components/node-settings/report-node-settings.component';
import { PinnedInputNodeSettingsComponent } from './components/node-settings/pinned-input-node-settings.component';

@NgModule({
  declarations: [
    CybertronFlowComponent,
    ChatNodeSettingsComponent,
    IntegrationNodeSettingsComponent,
    SchedulerNodeSettingsComponent,
    TaskNodeSettingsComponent,
    ReportNodeSettingsComponent,
    PinnedInputNodeSettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxGraphModule,
    FontAwesomeModule
  ],
  providers: [
    OrchestratorService,
    LangchainService,
    SchedulerService
  ],
  exports: [
    CybertronFlowComponent
  ]
})
export class CybertronFlowModule { } 