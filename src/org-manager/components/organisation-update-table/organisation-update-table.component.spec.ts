import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganisationVM } from '../../models/organisation';
import { OrganisationUpdateTableComponent } from './organisation-update-table.component';

describe('OrganisationUpdateTableComponent', () => {
  let component: OrganisationUpdateTableComponent;
  let fixture: ComponentFixture<OrganisationUpdateTableComponent>;

  const organisation = {
    name: 'Independent Test Organisation',
    admin: 'Alex Requester',
    adminEmail: 'alex.requester@example.com',
    addressLine1: '1 Current Street',
    addressLine2: 'Current District',
    townCity: 'London',
    county: 'Greater London',
    postCode: 'SW1A 1AA',
    dxNumber: [],
    sraId: 'SRA100001',
    dateRequested: new Date('2026-10-20T12:00:00.000Z')
  } as OrganisationVM;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [OrganisationUpdateTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganisationUpdateTableComponent);
    component = fixture.componentInstance;
    component.organisation = organisation;
    fixture.detectChanges();
  });

  it('should render an accessible comparison table with scoped headers', () => {
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;
    const caption = table.querySelector('caption');
    const columnHeaders = table.querySelectorAll('th[scope="col"]');
    const rowHeaders = table.querySelectorAll('th[scope="row"]');

    expect(caption?.textContent.trim()).toBe('Organisation update comparison');
    expect(columnHeaders.length).toBe(3);
    expect(rowHeaders.length).toBeGreaterThan(0);
    expect(table.textContent).toContain('Independent Test Organisation');
    expect(table.textContent).toContain('PENDING');
  });

  it('should safely identify a missing current DX address for assistive technology', () => {
    const dxRow = Array.from(fixture.nativeElement.querySelectorAll('tr'))
      .find((row: HTMLTableRowElement) => row.textContent.includes('DX Address')) as HTMLTableRowElement;

    expect(dxRow).toBeTruthy();
    expect(dxRow.cells[1].textContent.trim()).toBe('Not provided');
  });

  it('should expose button names and emit the selected decision', () => {
    spyOn(component.accept, 'emit');
    spyOn(component.reject, 'emit');
    const buttons = fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>;

    expect(buttons.length).toBe(2);
    expect(buttons[0].type).toBe('button');
    expect(buttons[0].textContent.trim()).toBe('Accept');
    expect(buttons[1].type).toBe('button');
    expect(buttons[1].textContent.trim()).toBe('Reject');

    buttons[0].click();
    buttons[1].click();

    expect(component.accept.emit).toHaveBeenCalledOnceWith();
    expect(component.reject.emit).toHaveBeenCalledOnceWith();
  });
});
