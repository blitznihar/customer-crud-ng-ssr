import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCustomers } from './createcustomers';

describe('CreateCustomers', () => {
  let component: CreateCustomers;
  let fixture: ComponentFixture<CreateCustomers>;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateCustomers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateCustomers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
