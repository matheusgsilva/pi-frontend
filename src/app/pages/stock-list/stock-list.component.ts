import { Component, OnInit } from '@angular/core';
import { Stock } from './stock.model';
import { ConfirmationService, MessageService, SelectItem } from 'primeng/api';
import { ProductService } from '../product-list/product.service';
import { StockService } from './stock.service';
import { ResponseAPI } from 'src/app/shared/response.model';
import { from } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { Product } from '../product-list/product.model';

@Component({
  selector: 'app-stock-list',
  templateUrl: './stock-list.component.html',
  styleUrls: ['./stock-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class StockListComponent implements OnInit {

  loading = false;
  stockDialog: boolean = false;

  filter: string = "";

  stocks: Stock[] = [];
  products: Product[] = [];

  stock: Stock = new Stock();

  selectedStocks: Stock[] = [];

  options: SelectItem[] = [];

  constructor(private messageService: MessageService, private confirmationService: ConfirmationService, private productService: ProductService, private stockService: StockService) { }

  ngOnInit() {
    this.list();
  }

  list() {
    this.loading = true;
    this.options = [];
    this.stockService.list().subscribe(response => {
      this.stocks = (response as ResponseAPI).data as Stock[] || [];
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
    this.stock = new Stock();
    this.stockDialog = true;
  }

  deleteSelectedStock() {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir os estoques selecionados?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        from(this.selectedStocks).pipe(
          switchMap((value) => this.stockService.delete(value.guid)),
          tap(() => this.selectedStocks = [])
        ).subscribe((response) => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  editStock(stock: Stock) {
    this.stock = { ...stock };
    this.stockDialog = true;
  }

  deleteStock(stock: Stock) {
    this.confirmationService.confirm({
      message: 'Você tem certeza que deseja excluir o estoque: ' + stock.productName + '?',
      header: 'Atenção',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.stockService.delete(stock.guid).subscribe(response => {
          this.getMessage((response as ResponseAPI).code);
        });
      }
    });
  }

  hideDialog() {
    this.stockDialog = false;
  }

  saveStock() {
    if (this.stocks.filter(s => s.guid == this.stock?.guid).length == 0)
      this.stockService.add({ ...this.stock }).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    else
      this.stockService.update({ ...this.stock }, this.stock.guid).subscribe(response => {
        this.getMessage((response as ResponseAPI).code);
      }, () => this.getMessage(404));
    this.stockDialog = false;
    this.stock = new Stock();
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

  findProduct(){
    const product = this.products.filter(item => item.guid == this.stock.productGuid);
    return product.length > 0 ? product[0].type : null;
  }
}
