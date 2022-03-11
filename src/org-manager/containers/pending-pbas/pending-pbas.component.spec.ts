import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { OrganisationService, PbaService } from '../../services';
import { PendingPBAsComponent } from './pending-pbas.component';
@Pipe({ name: 'paginate' })
class MockPipe implements PipeTransform {
  transform(value: number): number {
    return value;
  }
}
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
      declarations: [
        PendingPBAsComponent,
        MockPipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PendingPBAsComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
  });

});
