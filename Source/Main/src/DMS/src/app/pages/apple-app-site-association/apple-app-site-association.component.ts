import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'apple-app-site-association',
    template: ``,
})
export class AppleAppSiteAssociationComponent implements OnInit {
    constructor(
        private httpClient: HttpClient,
        private router: Router,
    ) {
        const options = {
            obsever: 'response',
            headers: new HttpHeaders({
                'Accept': 'application/json',
            }),
        }
        this.httpClient.get('/.well-known/apple-app-site-association', options).subscribe((binaryData: any) => {
            this.router.navigate(['/']);
        });
    }

    ngOnInit() { }
}
