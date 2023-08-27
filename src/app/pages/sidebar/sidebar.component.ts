import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { PrimeIcons } from 'primeng/api';
import { MenuItem } from 'primeng/api/menuitem';
import { PanelMenu } from 'primeng/panelmenu';
import { LoginService } from '../login/login.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() display = true;
  items: MenuItem[] = [];

  @ViewChild("menu") menu!: PanelMenu;

  constructor(private loginService: LoginService, private router: Router) { }

  ngOnInit(): void {
    this.items = [
      {
        label: 'Cadastros', icon: PrimeIcons.CLONE, expanded: true,
        items: [
          {
            label: 'Usuários', icon: PrimeIcons.USERS, routerLink: ['/users-list'],
            style: { 'background-color': this.router.url.includes("users-list") ? '#007eff5e' : 'white' }
          },
          {
            label: 'Produtos', icon: PrimeIcons.SHOPPING_CART, routerLink: ['/product-list'],
            style: { 'background-color': this.router.url.includes("product-list") ? '#007eff5e' : 'white' }
          },
          {
            label: 'Estoque', icon: PrimeIcons.CHECK_SQUARE, routerLink: ['/stock-list'],
            style: { 'background-color': this.router.url.includes("stock-list") ? '#007eff5e' : 'white' }
          },
          {
            label: 'Pedidos', icon: PrimeIcons.COPY, routerLink: ['/order-list'],
            style: { 'background-color': this.router.url.includes("order-list") ? '#007eff5e' : 'white' }
          }
        ]
      },
      {
        label: 'Sair', icon: PrimeIcons.SIGN_OUT, command: () => {
          this.loginService.logout();
        }
      }
    ];

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateStyle();
      }
    });
  }

  updateStyle() {
    let items = document.querySelectorAll("a.p-menuitem-link");
    items.forEach((item: any) => {
      if (item.href.includes(this.router.url))
        item.style.backgroundColor = "#007eff5e";
      else
        item.style.backgroundColor = "white";
    });
  }

  getUser(){
    return localStorage["userName"];
  }
}
