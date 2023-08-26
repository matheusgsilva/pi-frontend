import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SidebarModule } from "primeng/sidebar";
import { SidebarComponent } from "./sidebar/sidebar.component";
import { PanelMenuModule } from 'primeng/panelmenu';
import { NavbarComponent } from "./navbar/navbar.component";
import { ButtonModule } from 'primeng/button';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    PanelMenuModule,
    ButtonModule
  ],
  declarations: [
    SidebarComponent,
    NavbarComponent,
  ],
  exports: [
    SidebarComponent,
    NavbarComponent
  ]
})
export class ComponentsModule { }
