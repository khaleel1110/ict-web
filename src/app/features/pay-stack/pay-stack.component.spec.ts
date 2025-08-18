import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayStackComponent } from './pay-stack.component';

describe('PayStackComponent', () => {
  let component: PayStackComponent;
  let fixture: ComponentFixture<PayStackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayStackComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayStackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
