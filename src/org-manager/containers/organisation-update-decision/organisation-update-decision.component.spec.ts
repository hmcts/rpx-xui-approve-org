import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { OrganisationUpdateDecision, OrganisationUpdateDecisionComponent } from './organisation-update-decision.component';

describe('OrganisationUpdateDecisionComponent', () => {
  async function renderDecision(decision: OrganisationUpdateDecision): Promise<ComponentFixture<OrganisationUpdateDecisionComponent>> {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [OrganisationUpdateDecisionComponent],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot: { data: { decision } } } }]
    }).compileComponents();

    const fixture = TestBed.createComponent(OrganisationUpdateDecisionComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should render the accepted confirmation with a main landmark and return link', async () => {
    const fixture = await renderDecision('accepted');
    const main = fixture.nativeElement.querySelector('main[role="main"]') as HTMLElement;
    const heading = main.querySelector('h1') as HTMLHeadingElement;
    const backLink = main.querySelector('a') as HTMLAnchorElement;

    expect(heading.textContent.trim()).toBe('Organisation update accepted');
    expect(main.textContent).toContain('The requested organisation details are now current.');
    expect(backLink.textContent.trim()).toBe('Back to Organisations');
    expect(backLink.getAttribute('href')).toBe('/organisation/updates');
  });

  it('should render the rejected confirmation and guidance', async () => {
    const fixture = await renderDecision('rejected');
    const main = fixture.nativeElement.querySelector('main[role="main"]') as HTMLElement;

    expect(main.querySelector('h1').textContent.trim()).toBe('Organisation update rejected');
    expect(main.textContent).toContain('The requested changes have not been applied.');
  });
});
