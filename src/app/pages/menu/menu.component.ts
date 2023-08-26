import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  display = true;
  public innerWidth: any;
  public pixels: any;

  constructor() { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    if (this.innerWidth < 1091) {
      this.display = false;
    } else {
      this.display = true;
    }
    if (this.display && this.innerWidth > 1091)
      this.pixels = 250;
    else
      this.pixels = 0;
  }

  displaySide(display: boolean) {
    this.display = display;
  }

  @HostListener('click', ['$event'])
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (!(event instanceof PointerEvent)) {
      this.innerWidth = window.innerWidth;
      if (this.innerWidth < 1091) {
        this.display = false;
      } else {
        this.display = true;
      }
    }
    if (this.display && this.innerWidth > 1091)
      this.pixels = 250;
    else
      this.pixels = 0;
  }
}
