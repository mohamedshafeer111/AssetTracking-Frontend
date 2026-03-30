import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editprocessautomation } from './editprocessautomation';

describe('Editprocessautomation', () => {
  let component: Editprocessautomation;
  let fixture: ComponentFixture<Editprocessautomation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editprocessautomation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editprocessautomation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
