import { Component, OnInit } from '@angular/core';
import { Stock } from '../stock-list/stock.model';
import { ResponseAPI } from 'src/app/shared/response.model';
import { StockService } from '../stock-list/stock.service';
import { OrderItem } from '../order-item/order-item.model';
import { Order } from '../order-list/order.model';
import { OrderService } from '../order-list/order.service';
import { OrderItemService } from '../order-item/order-item.service';

@Component({
  selector: 'app-stock-map',
  templateUrl: './stock-map.component.html',
  styleUrls: ['./stock-map.component.scss']
})
export class StockMapComponent implements OnInit {

  stocks: Stock[] = [];
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  selectedOrderItems: OrderItem[] = [];

  constructor(private stockService: StockService, private orderService: OrderService, private orderItemService: OrderItemService) { }

  ngOnInit(): void {
    this.list();
  }

  list() {
    this.stockService.list().subscribe(response => {
      this.stocks = (response as ResponseAPI).data as Stock[] || [];
    });
    this.orderService.list().subscribe(response => {
      this.orders = (response as ResponseAPI).data as Order[] || [];
      this.orders = this.orders.filter(order => order.status == 'NEW')
    });
  }

  selectOrder(order: Order) {
    this.selectedOrder = order;
    this.orderItemService.list(order.guid).subscribe(response => {
      this.selectedOrderItems = (response as ResponseAPI).data as OrderItem[] || [];;
    });
  }

  isProductInSelectedOrder(productGuid: string): boolean {
    return this.selectedOrderItems.some(item => item.productGuid === productGuid);
  }

  get aisles(): any[] {
    const groupedByAisle = this.groupBy(this.stocks, 'aisle');
    return Object.keys(groupedByAisle).map(aisle => {
      return {
        name: aisle,
        shelves: this.getShelves(groupedByAisle[aisle])
      };
    });
  }

  private getShelves(stocks: Stock[]): any[] {
    const groupedByShelf = this.groupBy(stocks, 'shelf');
    return Object.keys(groupedByShelf).map(shelf => {
      return {
        name: shelf,
        stocks: groupedByShelf[shelf]
      };
    });
  }

  private groupBy(array: any[], key: string): any {
    return array.reduce((result, currentValue) => {
      (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
      return result;
    }, {});
  }

  translateStatus(status: string): string {
    switch (status) {
      case 'NEW':
        return 'NOVO';
      case 'PRODUCTION':
        return 'EM PRODUÇÃO';
      case 'FINISHED':
        return 'FINALIZADO';
      case 'SENT':
        return 'ENVIADO';
      default:
        return status;
    }
  }
}
