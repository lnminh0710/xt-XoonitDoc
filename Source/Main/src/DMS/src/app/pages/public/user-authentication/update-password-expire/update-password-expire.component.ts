import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/services';
import { Configuration } from '@app/app.constants';

@Component({
	selector: 'update-password-expire',
	templateUrl: './update-password-expire.component.html',
	styleUrls: ['./update-password-expire.component.scss']
})
export class UpdatePasswordExpireComponent implements OnInit {

	model: any = {};
	loading = false;
	returnUrl: string;
    loginUrl: string;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
        private authenticationService: AuthenticationService,
        private consts: Configuration) { }

    ngOnInit() {
        this.loginUrl = this.consts.loginUrl;
	}

	//submit() {
	//}
}
