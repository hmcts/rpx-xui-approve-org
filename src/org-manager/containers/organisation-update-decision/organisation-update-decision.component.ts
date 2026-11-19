import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

export type OrganisationUpdateDecision = 'accepted' | 'rejected';

@Component({
  selector: 'app-organisation-update-decision',
  templateUrl: './organisation-update-decision.component.html',
  standalone: false
})
export class OrganisationUpdateDecisionComponent {
  public readonly emailMessage = 'The organisation manager has been emailed to inform them of the decision.';
  public readonly decision: OrganisationUpdateDecision;

  constructor(route: ActivatedRoute) {
    this.decision = route.snapshot.data.decision;
  }

  public get accepted(): boolean {
    return this.decision === 'accepted';
  }
}
