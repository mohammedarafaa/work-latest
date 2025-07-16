import { AfterViewInit, Component, OnInit } from '@angular/core';
// import * as AOS from 'aos';
// import { gsap } from 'gsap';
// import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-blank-layouts',
  templateUrl: './blank-layouts.component.html',
  styleUrls: ['./blank-layouts.component.scss']
})
export class BlankLayoutsComponent implements OnInit, AfterViewInit{
  isLoading = true;

  ngOnInit() {
    // Initialize AOS
    // AOS.init({
    //   duration: 1000,
    //   once: true,
    //   easing: 'ease-in-out',
    //   mirror: false
    // });

    // Simulate loading
    setTimeout(() => {
      this.isLoading = false;
      this.initializeAnimations();
    }, 1500);
  }

  ngAfterViewInit() {
    this.initializeAnimations();
  }

  private initializeAnimations() {
    // Hero section animations
  //   gsap.from('.hero-content', {
  //     duration: 1,
  //     y: 100,
  //     opacity: 0,
  //     ease: 'power4.out',
  //     delay: 0.5
  //   });

  //   // Animate stats on scroll
  //   gsap.utils.toArray('.stat-item').forEach((stat: any) => {
  //     gsap.from(stat, {
  //       textContent: 0,
  //       duration: 2,
  //       ease: 'power1.in',
  //       snap: { textContent: 1 },
  //       scrollTrigger: {
  //         trigger: stat,
  //         start: 'top center+=100',
  //         toggleActions: 'play none none reverse'
  //       }
  //     });
  //   });

  //   // Parallax effect for features
  //   gsap.utils.toArray('.feature-card').forEach((card: any, i) => {
  //     gsap.from(card, {
  //       y: 100,
  //       opacity: 0,
  //       duration: 1,
  //       delay: i * 0.2,
  //       scrollTrigger: {
  //         trigger: card,
  //         start: 'top bottom-=100',
  //         toggleActions: 'play none none reverse'
  //       }
  //     });
  //   });
  }
}
