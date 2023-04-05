import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { StoreModule } from '@ngrx/store';
import { metaReducers } from 'src/app/app.module';
import { reducers } from 'src/app/store';
import { HmctsGlobalHeaderComponent } from './hmcts-global-header.component';

describe('HmctsGlobalHeaderComponent', () => {
  let component: HmctsGlobalHeaderComponent;
  let fixture: ComponentFixture<HmctsGlobalHeaderComponent>;

  beforeEach(waitForAsync(() => {
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

    component.userLoggedIn = true;

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
