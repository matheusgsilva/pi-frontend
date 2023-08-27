import { Component, OnInit } from '@angular/core';
import { OrderItem } from './order-item.model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderItemService } from './order-item.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { ProductService } from '../product-list/product.service';
import { Product } from '../product-list/product.model';

@Component({
  selector: 'app-order-item',
  templateUrl: './order-item.component.html',
  styleUrls: ['./order-item.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class OrderItemComponent implements OnInit {

  loading = false;
  orderItemDialog: boolean = false;

  orderGuid: any = "";
  filter: string = "";

  orderItems: OrderItem[] = [];
  products: Product[] = [];

  orderItem: OrderItem = new OrderItem();

  selectedOrderItems: OrderItem[] = [];

  options: SelectItem[] = [];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private productService: ProductService, private orderItemService: OrderItemService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.orderGuid = this.route.snapshot.paramMap.get('orderGuid');
    this.list();
  }

  list() {
    this.loading = true;
    this.products = [];
    this.options = [];
    this.orderItemService.list(this.orderGuid).subscribe(response => {
      this.orderItems = (response as ResponseAPI).data as OrderItem[] || [];
      this.loading = false;
    });
    this.productService.list().subscribe(response => {
      this.products = (response as ResponseAPI).data as Product[] || [];
      for (let index = 0; index < this.products.length; index++) {
        this.options.push({ label: this.products[index].name, value: this.products[index].guid });
      }
    });
  }

  openNew() {
    this.orderItem = new OrderItem();
    this.orderItemDialog = true;
  }

  deleteSelectedOrderItem() {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir os itens do pedido selecionados?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        from(this.selectedOrderItems).pipe(
          switchMap((value) => this.orderItemService.delete(value.guid)),
          tap(() => this.selectedOrderItems = [])
        ).subscribe((response) => {
          this.getMessage((response as ResponseAPI).code);
        }, () => this.getMessage(404));
      }
    });
  }

  editOrderItem(orderItem: OrderItem) {
    this.orderItem = { ...orderItem };
    this.orderItemDialog = true;
  }

  deleteOrderItem(orderItem: OrderItem) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir o item do pedido ?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.orderItemService.delete(orderItem.guid).subscribe(response => {
          this.getMessage((response as ResponseAPI).code);
        }, () => this.getMessage(404));
      }
    });
  }

  hideDialog() {
    this.orderItemDialog = false;
  }

  saveOrderItem() {
    if (this.orderItems.filter(s => s.guid == this.orderItem?.guid).length == 0)
      this.orderItemService.add({ ...this.orderItem, orderGuid: this.orderGuid }).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    else
      this.orderItemService.update({ ...this.orderItem, orderGuid: this.orderGuid }, this.orderItem.guid).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    this.orderItemDialog = false;
    this.orderItem = new OrderItem();
  }

  getMessage(code: number) {
    if (code == 200) {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Operação realizada!', life: 3000 });
      this.list();
    } else
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Operação não realizada!', life: 3000 });
  }

  clean(dt: any){
    this.filter = '';
    dt.filterGlobal(this.filter, 'contains');
  }

  findProduct(){
    const product = this.products.filter(item => item.guid == this.orderItem.productGuid);
    return product.length > 0 ? product[0].type : null;
  }

  undo(){
    window.history.back();
  }
}
