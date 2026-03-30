import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reusabletable } from './reusabletable';

describe('Reusabletable', () => {
  let component: Reusabletable;
  let fixture: ComponentFixture<Reusabletable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reusabletable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Reusabletable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
