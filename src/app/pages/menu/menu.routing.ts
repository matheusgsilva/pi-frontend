import { Routes } from "@angular/router";
import { AuthGuard } from "src/app/shared/auth.guard";
import { UsersListComponent } from "../users-list/users-list.component";
import { ProductListComponent } from "../product-list/product-list.component";
import { StockListComponent } from "../stock-list/stock-list.component";
import { OrderListComponent } from "../order-list/order-list.component";
import { OrderItemComponent } from "../order-item/order-item.component";
import { StockMapComponent } from "../stock-map/stock-map.component";
import { ReportComponent } from "../report/report.component";

export const routes: Routes = [
  { path: 'users-list', component: UsersListComponent, canActivate: [AuthGuard] },
  { path: 'product-list', component: ProductListComponent, canActivate: [AuthGuard] },
  { path: 'stock-list', component: StockListComponent, canActivate: [AuthGuard] },
  { path: 'stock-map', component: StockMapComponent, canActivate: [AuthGuard] },
  { path: 'order-list', component: OrderListComponent, canActivate: [AuthGuard] },
  { path: 'order-item-list', component: OrderItemComponent, canActivate: [AuthGuard] },
  { path: 'report', component: ReportComponent, canActivate: [AuthGuard] }
];
