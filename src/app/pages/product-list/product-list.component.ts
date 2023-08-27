import { Component, OnInit } from '@angular/core';
import { Product } from './product.model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ProductService } from './product.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class ProductListComponent implements OnInit {

  loading = false;
  productDialog: boolean = false;

  filter: string = "";

  products: Product[] = [];

  product: Product = new Product();

  selectedProducts: Product[] = [];

  options: SelectItem[] = [{label: "UNIDADE", value: "UNIT"}, {label: "PESO", value: "WEIGHT"}];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private productService: ProductService) { }

  ngOnInit() {
    this.list();
  }

  list() {
    this.loading = true;
    this.productService.list().subscribe(response => {
      this.products = (response as ResponseAPI).data as Product[] || [];
      this.loading = false;
    });
  }

  openNew() {
    this.product = new Product();
    this.productDialog = true;
  }

  deleteSelectedProduct() {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir os produtos selecionados?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        from(this.selectedProducts).pipe(
          switchMap((value) => this.productService.delete(value.guid)),
          tap(() => this.selectedProducts = [])
        ).subscribe((response) => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  editProduct(product: Product) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteProduct(product: Product) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir o produto: ' + product.name + '?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productService.delete(product.guid).subscribe(response => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  hideDialog() {
    this.productDialog = false;
  }

  saveProduct() {
    if (this.products.filter(s => s.guid == this.product?.guid).length == 0)
      this.productService.add({ ...this.product }).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    else
      this.productService.update({ ...this.product }, this.product.guid).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    this.productDialog = false;
    this.product = new Product();
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
}
