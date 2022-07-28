
import {
    Component,
    OnInit,
    Input,
    Output,
    OnDestroy,
    EventEmitter
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
import {
    SignalRNotifyModel
} from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';

@Component({
    selector: 'widget-user-editing-list',
    styleUrls: ['./widget-user-editing-list.component.scss'],
    templateUrl: './widget-user-editing-list.component.html'
})
export class WidgetUserEditingListComponent extends BaseComponent implements OnInit, OnDestroy {
    public userNameList: string = '';
    public commandIcon: string = 'fa-caret-down';
    public isShowUserList: boolean = false;
    public numberOfMore: number = 0;
    public userBodyStyle: any;
    public fieldBodyStyle: any;
    public userList: Array<SignalRNotifyModel> = [];

    private spacing = 20;
    private parentHeight = 320;
    private userHeaderHeight = 17;

    @Input() isUserClickToggle: boolean = false;
    @Input() set data(data: Array<SignalRNotifyModel>) {this.executeData(data);}
    @Input() set parent(data: any) {this.executeParent(data);}

    @Output() toggleClicked = new EventEmitter<boolean>();

    constructor(router ? : Router) {
        super(router);
    }

    public ngOnInit() {
    }

    public ngOnDestroy() {
    }

    public toggleUserList() {
        this.isShowUserList = !this.isShowUserList;
        this.commandIcon = this.isShowUserList ? 'fa-caret-up' : 'fa-caret-down';
        this.toggleClicked.emit(true);
    }

    public toggle(user: any) {
        user.hide = !user.hide;
    }

    /*************************************************************************************************/
    /***************************************PRIVATE METHOD********************************************/

    private executeData(data: Array<SignalRNotifyModel>) {
        if (!data || !data.length) {
            this.userNameList = '';
            this.numberOfMore = 0;
            return;
        }
        this.userNameList = data.map(p => p.UserName).join(', ');
        this.userList = cloneDeep(data);
        this.makeDisplayFieldText();
        this.calcMaxHeightForEachItem();
        if (data.length > 1) {
            this.numberOfMore  = data.length - 1;
        } else {
            this.numberOfMore = 0;
        }
        if (this.isUserClickToggle) return;
        this.isShowUserList = !!(this.userList.length);
    }

    private makeDisplayFieldText() {
        let filedArr: any = [];
        for (let item of this.userList) {
            for (let filed of item.Data) {
                filedArr = filed.fieldName.split('_');
                filed.text = ((filedArr && filedArr.length > 0) ? filedArr[1] : '');
                filed.value = filed.fieldValue;
            }
        }
    }

    private calcMaxHeightForEachItem() {
        let remainHeight = this.parentHeight - (this.userHeaderHeight * this.userList.length) - (this.spacing * (this.userList.length + 1));
        this.fieldBodyStyle = {
            'max-height': (remainHeight / this.userList.length) + 'px'
        };
    }

    private executeParent(data: any) {
        try {
            this.parentHeight = data.nativeElement.offsetParent.clientHeight;
        } catch(e){}
        this.userBodyStyle = {
            'max-height': this.parentHeight - this.spacing + 'px'
        };
    }
}
