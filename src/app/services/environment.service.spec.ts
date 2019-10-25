import { TestBed, inject } from '@angular/core/testing';

import { EnvironmentService } from './environment.service';
import {HttpClientModule} from '@angular/common/http';

describe('EnvironmentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EnvironmentService],
      imports: [HttpClientModule]
    });
  });

  it('should be created', inject([EnvironmentService], (service: EnvironmentService) => {
    expect(service).toBeTruthy();
  }));
});
