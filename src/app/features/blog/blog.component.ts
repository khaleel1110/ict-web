import { AfterViewInit, Component, inject } from '@angular/core';
import Swiper from 'swiper';
import { UsersService } from '../../services/users.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent implements AfterViewInit {
  private usersService = inject(UsersService);
  // Signal for today's matches
  todayUsers = toSignal(this.usersService.todayUsers$, { initialValue: [] });
  // Signal for upcoming matches
  futureUsers = toSignal(this.usersService.futureUsers$, { initialValue: [] });

  swiperMain: any;

  swiperMainChanged(event: any) {
    if (this.swiperMain === undefined) return
    this.swiperMain.slideTo(event.activeIndex)
    console.log('slider changed thumb');
  }



  ngAfterViewInit() {


    this.swiperMain = new Swiper('.swiper-js-container', {

      autoplay: true,
      slidesPerView:1,
      rewind: true,

    });


    setInterval(()=>{

      this.swiperMain.slideNext();

      console.log('proceeding to next');
    }, 7000);
  }
  // Array of image paths
  private images = [
    '/cartoon-4.png',
    '/cartoon-2.png',
    '/cartoon-1.png',
    '/cartoon-6.png',
    '/cartoon-3.png',
    '/cartoon-5.png',
  ];

  // Array of descriptions
  private description = [
    'Don’t miss this clash of titans—two top teams, one epic battle. Get ready for fireworks on the pitch!',
    'All eyes are on this explosive showdown! Lineups, analysis, and pure football drama await.',
    'Top-tier football action incoming! Stay tuned for match previews and real-time coverage.',
    'Two giants. One field. Zero room for error. Catch every moment of this high-stakes encounter!',
    'The stage is set, the stakes are high—get your matchday fix with previews and player updates.',
    'Unmissable action ahead! Dive into the preview, lineups, and live insights as it all unfolds.',
  ];

  // Method to get image based on index
  getImage(index: number): string {
    return this.images[index % this.images.length];
  }

  // Method to get description based on index
  getDescription(index: number): string {
    return this.description[index % this.description.length];
  }

  // Format time range from appointmentStartHour and appointmentDuration
  formatTime(startHour: number, duration: number): string {
    // Calculate start time
    const startPeriod = startHour >= 12 ? 'PM' : 'AM';
    const startFormattedHour = startHour % 12 || 12;

    // Calculate end time
    const endHour = startHour + duration;
    const endPeriod = endHour >= 12 ? 'PM' : 'AM';
    const endFormattedHour = endHour % 12 || 12;

    // Return formatted range (e.g., "9-10 PM" or "9 AM-10 PM")
    if (startPeriod === endPeriod) {
      return `${startFormattedHour}-${endFormattedHour} ${startPeriod}`;
    } else {
      return `${startFormattedHour} ${startPeriod}-${endFormattedHour} ${endPeriod}`;
    }
  }


}
