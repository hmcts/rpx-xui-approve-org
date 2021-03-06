import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HmctsGlobalHeaderComponent } from './hmcts-global-header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/app/store';
import { metaReducers } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('HmctsGlobalHeaderComponent', () => {
  let component: HmctsGlobalHeaderComponent;
  let fixture: ComponentFixture<HmctsGlobalHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HmctsGlobalHeaderComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        StoreModule.forRoot(reducers, { metaReducers }),
        RouterTestingModule
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HmctsGlobalHeaderComponent);
    component = fixture.componentInstance;

    component.navigation = {
      label: 'Account navigation',
      items: [{
        text: 'Nav item 1',
        href: '#1',
        emit: 'emit1'
      }, {
        text: 'Nav item 2',
        href: '#2',
        emit: 'emit2'
      }]
    };

    component.serviceName = {
      name: 'some name'
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit onEmit', () => {
    spyOn(component.navigate, 'emit');
    component.onEmitEvent(1);
    expect(component.navigate.emit).toHaveBeenCalledWith('emit2');
  });
});
