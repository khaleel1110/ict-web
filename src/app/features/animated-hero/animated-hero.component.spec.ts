import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedHeroComponent } from './animated-hero.component';

describe('AnimatedHeroComponent', () => {
  let component: AnimatedHeroComponent;
  let fixture: ComponentFixture<AnimatedHeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedHeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimatedHeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
