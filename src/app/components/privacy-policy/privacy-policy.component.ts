import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-privacy-policy',
    templateUrl: './privacy-policy.component.html'
})
export class PrivacyPolicyComponent implements OnInit {

    constructor(
        private readonly _route: ActivatedRoute,
        @Inject(DOCUMENT) private readonly _document: Document
    ) { }

    public ngOnInit() {
        this._route.fragment.subscribe(fragment => {
            try {
                if (this._document) {
                    this._document.querySelector(`#${fragment}`).scrollIntoView();
                }
            } catch (e) { }
        });
    }
}
