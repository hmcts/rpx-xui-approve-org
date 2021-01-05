import { RedirectComponent } from './redirect.component';
describe('RedirectComponent', () => {
    const cookieService = jasmine.createSpyObj('cookieService', ['getObject']);
    const router = jasmine.createSpyObj('router', ['navigate']);
    let component: RedirectComponent;
    beforeEach(() => {
        component = new RedirectComponent(cookieService, router);
    });

    it('should create the HeaderComponent', () => {
        expect(component).toBeTruthy();
    });
    it('getRedirectUrl', () => {
        const url = component.getRedirectUrl('j%3A%5B%22prd-admin%22%2C%22prd-aac-system%22%2C%22xui-approver-userdata%22%2C%22cwd-admin%22%5D');
        expect(url).toEqual('pending-organisations');
    });
    it('incorrect  roles', () => {
        const url = component.getRedirectUrl('j%3A%5B%22prd-admin%22%5D%3A%5B%22test%22%5D');
        expect(url).toBeNull();
    });
    it('ngOnInit', () => {
        cookieService.getObject.and.returnValue('j%3A%5B%22prd-admin%22%2C%22prd-aac-system%22%2C%22xui-approver-userdata%22%2C%22cwd-admin%22%5D');
        component.ngOnInit();
        expect(router.navigate).toHaveBeenCalledWith(['pending-organisations']);
    })
});
