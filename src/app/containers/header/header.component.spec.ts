import { TestBed, async } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { reducers } from 'src/app/store/reducers';
import { CookieService } from 'ngx-cookie';

describe('HeaderComponent', () => {
    let fixture;
    let app;
    const cookieService = jasmine.createSpyObj('cookieSevice', ['getObject']);
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                StoreModule.forRoot({}),
                StoreModule.forFeature('app', reducers),
            ],
            declarations: [
                HeaderComponent
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{ provide: CookieService, useValue: cookieService }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(HeaderComponent);
        app = fixture.debugElement.componentInstance;
    }));

    it('should create the HeaderComponent', () => {
        expect(app).toBeTruthy();
    });

    it('should emit navigate event', () => {
        spyOn(app.navigate, 'emit');
        app.onNavigate('dummy');
        expect(app.navigate.emit).toHaveBeenCalledWith('dummy');
    });

    it('Service name should be "Approve organisation"', () => {
        app.ngOnInit();
        expect(app.serviceName.name).toBe('Approve organisation');
    });

});
