import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/shared/auth.guard";
import { UsersListComponent } from "../users-list/users-list.component";
import { ProductListComponent } from "../product-list/product-list.component";

export const routes: Routes = [
  { path: 'users-list', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
];
