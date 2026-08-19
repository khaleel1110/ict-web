import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsideServiceComponent } from './aside-service.component';

describe('AsideServiceComponent', () => {
  let component: AsideServiceComponent;
  let fixture: ComponentFixture<AsideServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsideServiceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsideServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
