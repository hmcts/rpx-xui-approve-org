import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-quick-links-old',
  templateUrl: './quick-links-old.component.html',
  styleUrls: ['./quick-links-old.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class QuickLinksOldComponent implements OnInit {
  public organisationNameEncoded: string;
  @Input() public sraId?: string;
  @Input() public organisationName?: string;

  public ngOnInit(): void {
    this.organisationNameEncoded = encodeURIComponent(this.organisationName);
  }
}
