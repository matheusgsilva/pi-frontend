import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/shared/auth.guard";
import { UsersListComponent } from "../users-list/users-list.component";
import { ProductListComponent } from "../product-list/product-list.component";
import { StockListComponent } from "../stock-list/stock-list.component";

export const routes: Routes = [
  { path: 'users-list', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'stock-list', component: StockListComponent, canActivate: [AuthGuard] }
];
