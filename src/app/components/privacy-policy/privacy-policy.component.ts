import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {

    constructor(
        private readonly route: ActivatedRoute,
        @Inject(DOCUMENT) private readonly document: Document
    ) { }

    public ngOnInit() {
        this.route.fragment.subscribe(fragment => {
            try {
                if (this.document) {
                    this.document.querySelector(`#${fragment}`).scrollIntoView();
                }
            } catch (e) { }
        });
    }
}
