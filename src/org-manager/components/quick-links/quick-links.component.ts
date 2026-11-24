import { Component, Input, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class QuickLinksComponent implements OnInit {
  public organisationNameEncoded: string;
  @Input() public sraId?: string;
  @Input() public organisationName?: string;

  public ngOnInit(): void {
    this.organisationNameEncoded = encodeURIComponent(this.organisationName);
  }
}
