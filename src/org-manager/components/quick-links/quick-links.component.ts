import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-quick-links',
  templateUrl: './quick-links.component.html',
  styleUrls: ['./quick-links.scss']
})
export class QuickLinksComponent implements OnInit {
  public organisationNameEncoded: string;
  @Input() sraId?: string;
  @Input() organisationName?: string

  constructor() { }

  ngOnInit(): void {
    this.organisationNameEncoded = encodeURIComponent(this.organisationName);
  }
}
