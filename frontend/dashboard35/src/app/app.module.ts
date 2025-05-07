import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';
import { AvaAssistantComponent } from './ava-assistant/ava-assistant.component';
import { OverviewComponent } from './overview/overview.component';
import { AiEcosystemsComponent } from './ai-ecosystems/ai-ecosystems.component';
import { AiLabComponent } from './ai-lab/ai-lab.component';
import { AiModelsComponent } from './ai-models/ai-models.component';
import { ModelQuantizationComponent } from './model-quantization/model-quantization.component';
import { ProtocolsComponent } from './protocols/protocols.component';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import { BlockchainComponent } from './blockchain/blockchain.component';
import { BlockchainWalletsComponent } from './blockchain-wallets/blockchain-wallets.component';
import { SmartContractsComponent } from './smart-contracts/smart-contracts.component';
import { ProjectsComponent } from './projects/projects.component';
import { ProjectsCreateComponent } from './projects-create/projects-create.component';
import { ProjectsTemplatesComponent } from './projects-templates/projects-templates.component';
import { ResearchComponent } from './research/research.component';
import { SystemComponent } from './system/system.component';
import { ServersComponent } from './servers/servers.component';
import { ApplicationsComponent } from './applications/applications.component';
import { MeteorEditorComponent } from './meteor-editor/meteor-editor.component';
import { OracleCliComponent } from './oracle-cli/oracle-cli.component';
import { TemporalCalendarComponent } from './temporal-calendar/temporal-calendar.component';
import { QuantumComponent } from './quantum/quantum.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    OverviewComponent,
    AiEcosystemsComponent,
    AiLabComponent,
    AiModelsComponent,
    ModelQuantizationComponent,
    ProtocolsComponent,
    KnowledgeComponent,
    BlockchainComponent,
    BlockchainWalletsComponent,
    SmartContractsComponent,
    ProjectsComponent,
    ProjectsCreateComponent,
    ProjectsTemplatesComponent,
    ResearchComponent,
    SystemComponent,
    ServersComponent,
    ApplicationsComponent,
    MeteorEditorComponent,
    OracleCliComponent,
    TemporalCalendarComponent,
    QuantumComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AvaAssistantComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }