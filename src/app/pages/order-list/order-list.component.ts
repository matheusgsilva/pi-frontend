import { Component, OnInit } from '@angular/core';
import { Order } from './order.model';
import { ConfirmationService, MessageService } from 'primeng/api';
import { OrderService } from './order.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { OrderItem } from '../order-item/order-item.model';
import { OrderItemService } from '../order-item/order-item.service';
import { Stock } from '../stock-list/stock.model';
import { StockService } from '../stock-list/stock.service';

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

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private stockService: StockService, private orderItemService: OrderItemService, private orderService: OrderService, private router: Router) { }

  ngOnInit() {
    this.list();
  }

  list() {
    this.loading = true;
    this.orderService.list().subscribe(async response => {
      this.orders = (response as ResponseAPI).data as Order[] || [];
      for (let index = 0; index < this.orders.length; index++) {
        this.orders[index].hasStock = await this.areAllItemsValid(this.orders[index].guid);
      }
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

  navigate(orderGuid: string, orderStatus: string, orderNumber: string) {
    this.router.navigate(['/order-item-list', { orderGuid, orderStatus, orderNumber }]);
  }

  async areAllItemsValid(orderGuid: string): Promise<boolean> {
    let orderItems: OrderItem[] = [];

    try {
      const response = await this.orderItemService.list(orderGuid).toPromise();
      orderItems = (response as ResponseAPI).data as OrderItem[] || [];
    } catch (error) {
      console.error("Error fetching order items:", error);
      return false;
    }

    return orderItems.every(item => {
      if (item.productType === 'UNIT') {
        return item.quantityAvailable - item.quantity >= 0;
      } else if (item.productType === 'WEIGHT') {
        return item.weightAvailable - item.weight >= 0;
      }
      return false;
    });
  }

  async saveOrderStatusNext(order: Order): Promise<void> {
    if (order.status == "PRODUCTION") {
      try {
        const response = await this.orderItemService.list(order.guid).toPromise();
        let orderItems: OrderItem[] = (response as ResponseAPI).data as OrderItem[] || [];

        const stockResponse = await this.stockService.list().toPromise();
        let stocks: Stock[] = (stockResponse as ResponseAPI).data || [];

        orderItems.forEach(orderItem => {
          const stock = stocks.find(s => s.productGuid === orderItem.productGuid);
          if (stock) {
            if (orderItem.productType == "UNIT") {
              stock.quantityAvailable = stock.quantityAvailable - orderItem.quantity;
            } else if (orderItem.productType == "WEIGHT") {
              stock.weightAvailable = stock.weightAvailable - orderItem.weight;
            }
          }
        });

        for (const stock of stocks) {
          await this.stockService.update({ ...stock }, stock.guid).toPromise();
        }
      } catch (error) {
        console.error("Error processing order:", error);
        this.getMessage(404);
        return;
      }
    }

    try {
      const response = await this.orderService.update({ ...order, userGuid: localStorage["userGuid"], status: order.status == 'NEW' ? 'PRODUCTION' : order.status == 'PRODUCTION' ? 'FINISHED' : 'SENT' }, order.guid).toPromise();
      this.getMessage((response as ResponseAPI).code);
    } catch (error) {
      console.error("Error updating order:", error);
      this.getMessage(404);
    }
  }

  async saveOrderStatusBack(order: Order): Promise<void> {
    try {
      const response = await this.orderItemService.list(order.guid).toPromise();
      let orderItems: OrderItem[] = (response as ResponseAPI).data as OrderItem[] || [];

      const stockResponse = await this.stockService.list().toPromise();
      let stocks: Stock[] = (stockResponse as ResponseAPI).data || [];

      orderItems.forEach(orderItem => {
        const stock = stocks.find(s => s.productGuid === orderItem.productGuid);
        if (stock) {
          if (orderItem.productType == "UNIT") {
            stock.quantityAvailable = stock.quantityAvailable + orderItem.quantity;
          } else if (orderItem.productType == "WEIGHT") {
            stock.weightAvailable = stock.weightAvailable + orderItem.weight;
          }
        }
      });

      for (const stock of stocks) {
        await this.stockService.update({ ...stock }, stock.guid).toPromise();
      }
    } catch (error) {
      console.error("Error processing order:", error);
      this.getMessage(404);
      return;
    }

    try {
      const response = await this.orderService.update({ ...order, userGuid: localStorage["userGuid"], status: 'NEW' }, order.guid).toPromise();
      this.getMessage((response as ResponseAPI).code);
    } catch (error) {
      console.error("Error updating order:", error);
      this.getMessage(404);
    }
  }

}
