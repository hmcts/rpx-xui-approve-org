import { of } from 'rxjs';
import * as fromAppStore from '../../../app/store';
import { ServiceDownComponent } from './service-down.component';

describe('ServiceDownComponent', () => {
  let component: ServiceDownComponent;
  let userStoreSpyObject;

  beforeEach(() => {
    userStoreSpyObject = jasmine.createSpyObj('Store', ['pipe', 'select', 'dispatch']);
    userStoreSpyObject.pipe.and.returnValue(of('text'));
    component = new ServiceDownComponent(userStoreSpyObject);
    component.ngOnInit();
  });

  it('Is Truthy', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch fromRoot.ClearGlobalError action on destroy', () => {
    const expectedAction = new fromAppStore.ClearGlobalError();
    component.ngOnDestroy();
    expect(userStoreSpyObject.dispatch).toHaveBeenCalledWith(expectedAction);
  });
});
