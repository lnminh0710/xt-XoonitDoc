import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './public.component.html'
})

export class PublicComponent implements OnInit {

    constructor() { }

    ngOnInit() {
        $('#page-loading').remove();
    }
}
