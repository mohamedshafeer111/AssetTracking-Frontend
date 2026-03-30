import { TestBed } from '@angular/core/testing';

import { Historical } from './historical';

describe('Historical', () => {
  let service: Historical;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Historical);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
