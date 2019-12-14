import { PrivacyPolicyComponent } from './privacy-policy.component';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

let component: PrivacyPolicyComponent;
let fixture: ComponentFixture<PrivacyPolicyComponent>;
describe('PrivacyPolicyComponent', () => {
beforeEach((() => {
    TestBed.configureTestingModule({
        imports: [
        ],
        declarations: [
            PrivacyPolicyComponent
        ],
        providers: [
            {provide: ActivatedRoute,
            useValue: {
              params: Observable.of({id: 123})
            }}]
    }).compileComponents();

    fixture = TestBed.createComponent(PrivacyPolicyComponent);
    component = fixture.componentInstance;

    }));

it('should have a component', () => {
        expect(component).toBeTruthy();
    });
});
