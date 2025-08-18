import {Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import gsap from "gsap";
@Component({
  selector: 'app-animated-hero',
  standalone: true,
  imports: [],
  templateUrl: './animated-hero.component.html',

  styleUrl: './animated-hero.component.scss'
})
export class AnimatedHeroComponent implements OnInit, OnDestroy {
  rect: DOMRect | any;
  mouse = {x: 0, y: 0, moved: false};
  constructor(private elementRef: ElementRef) {
  }
  ngOnInit() {


  }

  ngAfterViewInit():void{

    let mm = gsap.matchMedia();
    mm.add("(min-width: 992px)", () => {
      this.rect = this.elementRef.nativeElement?.querySelector('#container-Parallax-hero').getBoundingClientRect();
      console.log(this.rect)
      this.elementRef.nativeElement.querySelector('#container-Parallax-hero').addEventListener('mousemove', (e: any) => {
        this.mouse.moved = true;
        this.mouse.x = e.clientX - this.rect.left;
        this.mouse.y = e.clientY - this.rect.top;
      });

      gsap.ticker.add(() => {
        if (this.mouse.moved) {
          this.parallaxIt(".slide-circle", 80);
          this.parallaxIt(".slide-circular-dash", -30);
          this.parallaxIt(".slide-dots", -30);
        }
        this.mouse.moved = false;
      });

      window.addEventListener('resize', this.updateRect.bind(this));
      window.addEventListener('scroll', this.updateRect.bind(this));
    });

  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.updateRect.bind(this));
    window.removeEventListener('scroll', this.updateRect.bind(this));
  }

  updateRect(): void {
    this.rect = this.elementRef.nativeElement.querySelector('#container').getBoundingClientRect();
  }

  parallaxIt(target: string, movement: number): void {
    gsap.to(target, {
      duration: 0.5,
      x: (this.mouse.x - this.rect.width / 2) / this.rect.width * movement,
      y: (this.mouse.y - this.rect.height / 2) / this.rect.height * movement
    });
  }

}
