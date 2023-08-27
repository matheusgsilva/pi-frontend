import { Component, OnInit } from '@angular/core';
import { Order } from './order.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrderService } from './order.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class OrderListComponent implements OnInit {

  loading = false;
  orderDialog: boolean = false;

  filter: string = "";

  orders: Order[] = [];

  order: Order = new Order();

  selectedOrders: Order[] = [];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private orderService: OrderService, private router: Router) { }

  ngOnInit() {
    this.list();
  }

  list() {
    this.loading = true;
    this.orderService.list().subscribe(response => {
      this.orders = (response as ResponseAPI).data as Order[] || [];
      this.loading = false;
    });
  }

  openNew() {
    this.order = new Order();
    this.orderDialog = true;
  }

  deleteSelectedOrder() {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir os pedidos selecionados?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        from(this.selectedOrders).pipe(
          switchMap((value) => this.orderService.delete(value.guid)),
          tap(() => this.selectedOrders = [])
        ).subscribe((response) => {
          this.getMessage((response as ResponseAPI).code);
        }, () => this.getMessage(404));
      }
    });
  }

  editOrder(order: Order) {
    this.order = { ...order };
    this.orderDialog = true;
  }

  deleteOrder(order: Order) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir o pedido: ' + order.number + '?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderService.delete(order.guid).subscribe(response => {
          this.getMessage((response as ResponseAPI).code);
        }, () => this.getMessage(404));
      }
    });
  }

  hideDialog() {
    this.orderDialog = false;
  }

  saveOrder() {
    if (this.orders.filter(s => s.guid == this.order?.guid).length == 0)
      this.orderService.add({ ...this.order, userGuid: localStorage["userGuid"] }).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    else
      this.orderService.update({ ...this.order, userGuid: localStorage["userGuid"] }, this.order.guid).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    this.orderDialog = false;
    this.order = new Order();
  }

  saveOrderStatusNext(order: Order) {
    this.orderService.update({ ...order, userGuid: localStorage["userGuid"], status: order.status == 'NEW' ? 'PRODUCTION' : order.status == 'PRODUCTION' ? 'FINISHED' : 'SENT' }, order.guid).subscribe(response => {
      this.getMessage((response as ResponseAPI).code);
    }, () => this.getMessage(404));
    this.order = new Order();
  }

  saveOrderStatusBack(order: Order) {
    this.orderService.update({ ...order, userGuid: localStorage["userGuid"], status: order.status == 'SENT' ? 'FINISHED' : order.status == 'FINISHED' ? 'PRODUCTION' : 'NEW' }, order.guid).subscribe(response => {
      this.getMessage((response as ResponseAPI).code);
    }, () => this.getMessage(404));
    this.order = new Order();
  }

  getMessage(code: number) {
    if (code == 200) {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Operação realizada!', life: 3000 });
      this.list();
    } else
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Operação não realizada!', life: 3000 });
  }

  clean(dt: any) {
    this.filter = '';
    dt.filterGlobal(this.filter, 'contains');
  }

  navigate(orderGuid: string) {
    this.router.navigate(['/order-item-list', { orderGuid }]);
  }
}
