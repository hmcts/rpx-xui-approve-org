import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { OrganisationService, PbaService } from '../../services';
import { PBANumberModel } from './models';
import { PendingPBAsComponent } from './pending-pbas.component';

describe('PendingPBAsComponent', () => {
  let component: PendingPBAsComponent;
  let fixture: ComponentFixture<PendingPBAsComponent>;
  let router: Router;
  const pbaServiceSpy = jasmine.createSpyObj('PbaService', ['setPBAStatus', 'searchPbasWithPagination']);

  beforeEach(() => {
    router = jasmine.createSpyObj('router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [
        { provide: PbaService, useValue: pbaServiceSpy },
        OrganisationService
      ],
      declarations: [PendingPBAsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPBAsComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
  });

});
