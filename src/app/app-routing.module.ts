import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MenuComponent } from './pages/menu/menu.component';

const routes: Routes = [
  { path: '', redirectTo: '/users-list', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginModule),
  },
  {
    path: '',
    component: MenuComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./pages/menu/menu.module').then((m) => m.MenuModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled', onSameUrlNavigation:'reload'})],
  exports: [RouterModule],
})
export class AppRoutingModule {}
