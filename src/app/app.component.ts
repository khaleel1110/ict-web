import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {LayOutComponent} from './core/lay-out/lay-out.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayOutComponent],
  template: `<app-lay-out></app-lay-out>`,


})
export class AppComponent {
  title = '5-asidse';
/*  constructor() {
    AOS.init();

  }*/
}
