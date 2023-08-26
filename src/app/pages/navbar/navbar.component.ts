import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  @Input() display = true;
  @Input() pixels: number = 0;
  @Output() displaySide = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  setDisplay() {
    if (this.display) {
      this.displaySide.emit(false);
    } else {
      this.displaySide.emit(true);
    }
  }

  getSize(){
    return this.pixels + "px"
  }
}
