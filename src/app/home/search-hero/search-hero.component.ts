import {AfterViewInit, Component, ElementRef, inject, OnDestroy, OnInit, Type} from '@angular/core';
import {FormsModule} from '@angular/forms';
import Typed from 'typed.js';
import {Router, RouterLink} from '@angular/router';



@Component({
  standalone: true,
  selector: 'app-search-hero',
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './search-hero.component.html',
  styleUrl: './search-hero.component.scss'
})
export class SearchHeroComponent implements OnInit, OnDestroy, AfterViewInit {
  searchQuery: string = '';
  heroText = $localize`book your next match`;
  heroText2 = $localize`play with your team`;


  searchPlaceHolder = $localize`Enter location, building type, listing agents etc`;
  isPlaying: boolean = false;
  videoElement: HTMLVideoElement | undefined;
  intersectionObserver: IntersectionObserver | undefined;
  private elementRef: ElementRef = inject(ElementRef);
  private router = inject(Router);
  ngAfterViewInit() {
    this.videoElement = this.elementRef.nativeElement.querySelector('video');

    if (this.videoElement) {


      this.intersectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.playVideo().then(c => {
            });
          } else {
            this.pauseVideo();

          }
        });
      });

      this.intersectionObserver.observe(this.videoElement);
    }
  }

  async playVideo() {
    if (this.videoElement && this.videoElement.paused) {
      await this.videoElement.play();
      this.isPlaying = true;
    }
  }

  pauseVideo() {
    if (this.videoElement && !this.videoElement.paused) {
      this.videoElement.pause();
      this.isPlaying = false;
    }
  }

  async togglePlay() {
    if(this.isPlaying)
    {
      this.pauseVideo()
    }else{
      await this.playVideo();
    }
  }



  search(query: string): void {
    this.router.navigate(['/search']);
  }

  ngOnInit() {

    const options = {
      strings: [this.heroText, this.heroText2],
      typeSpeed: 90,
      backSpeed: 30,
      backDelay: 2500,
      showCursor: true,
      cursorChar: '|',
      loop: true
    };


    const typed = new Typed('.js-typedjs', options);

  }




  ngOnDestroy(): void {
  }
}
