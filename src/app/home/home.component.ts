import { Component } from '@angular/core';
import {SearchHeroComponent} from './search-hero/search-hero.component';
import {AsideServiceComponent} from './aside-service/aside-service.component';

import {
  NgbAccordionBody,
  NgbAccordionButton, NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';
import {HeaderComponent} from '../core/header/header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchHeroComponent,
    AsideServiceComponent,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionBody,
    HeaderComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
