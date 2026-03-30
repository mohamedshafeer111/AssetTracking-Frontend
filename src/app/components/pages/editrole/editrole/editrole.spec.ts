import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Editrole } from './editrole';

describe('Editrole', () => {
  let component: Editrole;
  let fixture: ComponentFixture<Editrole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Editrole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Editrole);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
