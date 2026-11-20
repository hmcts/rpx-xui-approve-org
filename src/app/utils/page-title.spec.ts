import { Route, Routes } from '@angular/router';
import { ROUTES as appRoutes } from '../app.routes';
import { ROUTES as organisationRoutes } from '../../org-manager/org-manager.routing';
import { ROUTES as staffRoutes } from '../../caseworker-ref-data/caseworker-ref-data.routing';
import { pageTitle } from './page-title';

function contentRoutes(routes: Routes): Route[] {
  return routes.flatMap((route) => route.children ? contentRoutes(route.children) : [route])
    .filter((route) => route.component && route.path !== '' && route.path !== 'home');
}

describe('Page titles', () => {
  it('should use the requested New Registrations title', () => {
    const route = contentRoutes(organisationRoutes).find((item) => item.path === 'pending');
    expect(pageTitle(route.data.title)).toBe('New Registrations - Approve Organisation - HM Courts & Tribunals Service - GOV.UK');
  });

  [...contentRoutes(appRoutes), ...contentRoutes(organisationRoutes), ...staffRoutes].forEach((route) => {
    it(`should provide a descriptive title for ${route.path || 'staff upload'}`, () => {
      expect(typeof route.data?.title).toBe('string');
      expect(route.data?.title?.trim().length).toBeGreaterThan(0);
      expect(pageTitle(route.data?.title)).toMatch(/ - Approve Organisation - HM Courts & Tribunals Service - GOV.UK$/);
    });
  });
});
