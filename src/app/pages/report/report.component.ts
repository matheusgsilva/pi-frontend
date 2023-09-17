import { Component, OnInit } from '@angular/core';
import { OrderService } from '../order-list/order.service';
import { ProductService } from '../product-list/product.service';
import { OrderItemService } from '../order-item/order-item.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { Order } from '../order-list/order.model';
import { OrderItem } from '../order-item/order-item.model';
import { Product } from '../product-list/product.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  orderItems: OrderItem[] = [];
  totalAmount: number = 0;
  data: any;
  options = {
    scales: {
      yAxes: [{
        ticks: {
          stepSize: 10
        }
      }]
    }
  };

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private orderItemService: OrderItemService
  ) { }

  ngOnInit(): void {
    this.loadFinishedOrders();
    this.loadProducts();
  }

  loadFinishedOrders() {
    this.orderService.list().subscribe(response => {
      this.orders = ((response as ResponseAPI).data as Order[] || []).filter(order => order.status == 'FINISHED');

      const orderItemObservables = this.orders.map((order: Order) => this.orderItemService.list(order.guid));

      forkJoin(orderItemObservables).subscribe(orderItemsResponses => {
        orderItemsResponses.forEach(response => {
          const orderItems = (response as ResponseAPI).data as OrderItem[] || [];
          this.orderItems.push(...orderItems);
        });

        this.calculateTotalAmount();
        this.initializeChartData();
      });
    });
  }

  loadProducts() {
    this.productService.list().subscribe(response => {
      this.products = (response as ResponseAPI).data as Product[] || [];
    });
  }

  calculateTotalAmount() {
    this.totalAmount = this.orderItems.reduce((sum, orderItem) => {
      const product = this.products.find(p => p.guid === orderItem.productGuid);
      return sum + (product ? product.price * orderItem.quantity : 0);
    }, 0);
  }

  initializeChartData() {
    const productLabels = this.products.map(product => product.name);
    const productOrderCounts = this.products.map(product => {
      return this.orderItems.filter(orderItem => orderItem.productGuid === product.guid).length;
    });

    this.data = {
      labels: productLabels,
      datasets: [
        {
          label: 'Quantidade de Itens de Pedido por Produto',
          data: productOrderCounts,
          fill: false,
          borderColor: '#4bc0c0',
          backgroundColor: '#4bc0c0'
        }
      ]
    };
  }

  exportToCSV() {
    const headers = ['ID do Pedido', 'Nome do Produto', 'Quantidade', 'Preço Unitário', 'Total'];
    const csvData = this.orderItems.map(orderItem => {
      const product = this.products.find(p => p.guid === orderItem.productGuid);
      return {
        orderId: orderItem.orderGuid,
        productName: product ? product.name : 'Desconhecido',
        quantity: orderItem.quantity,
        unitPrice: product ? product.price : 0,
        total: product ? product.price * orderItem.quantity : 0
      };
    });

    const csvContent = '\uFEFF' + headers.join(';') + '\n'
      + csvData.map(e => Object.values(e).join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'report.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getProductName(orderItem: any): string {
    const product = this.products.find(p => p.guid === orderItem.productGuid);
    return product ? product.name : 'Desconhecido';
  }

  getProductPrice(orderItem: any): number {
    const product = this.products.find(p => p.guid === orderItem.productGuid);
    return product ? product.price : 0;
  }

  getTotalPrice(orderItem: any): number {
    return orderItem.quantity * this.getProductPrice(orderItem);
  }

}
