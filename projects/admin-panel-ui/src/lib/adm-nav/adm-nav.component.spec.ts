import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmNavComponent } from './adm-nav.component';

describe('AdmNavComponent', () => {
  let component: AdmNavComponent;
  let fixture: ComponentFixture<AdmNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdmNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdmNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
