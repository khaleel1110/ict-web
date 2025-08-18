import { Component } from '@angular/core';
import {SearchHeroComponent} from './search-hero/search-hero.component';
import {AsideServiceComponent} from './aside-service/aside-service.component';
import {AnimatedHeroComponent} from '../animated-hero/animated-hero.component';
import {
  NgbAccordionBody,
  NgbAccordionButton, NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    SearchHeroComponent,
    AsideServiceComponent,
    AnimatedHeroComponent,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionBody
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
