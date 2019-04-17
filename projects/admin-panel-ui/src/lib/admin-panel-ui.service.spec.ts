import { TestBed } from '@angular/core/testing';

import { AdminPanelUiService } from './admin-panel-ui.service';

describe('AdminPanelUiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AdminPanelUiService = TestBed.get(AdminPanelUiService);
    expect(service).toBeTruthy();
  });
});
