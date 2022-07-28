import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    ChangeDetectorRef,
    SimpleChanges,
    OnChanges,
    OnDestroy,
} from '@angular/core';
import { AdministrationDocumentSelectors } from '@app/state-management/store/reducer';
import { AdministrationDocumentActions } from '@app/state-management/store/actions';
import { Subscription, Subject, BehaviorSubject } from 'rxjs';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { Uti } from '@app/utilities';
import { filter, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

var timeOutTodo: any;
var timeOutKeyword: any;
var timeOutOriginalFileName: any;

@Component({
    selector: 'image-toolbar-secondary',
    templateUrl: './image-toolbar-secondary.component.html',
    styleUrls: ['./image-toolbar-secondary.component.scss'],
})
export class ImageToolbarSecondaryComponent implements OnInit, OnChanges, OnDestroy {
    private _txtKeywordChanged = new Subject<string>();
    private _txtToDosChanged = new Subject<string>();
    private _txtOriginalFileNameChanged = new Subject<string>();
    private _untilDestroyed = new Subject<boolean>();

    //Input
    @Input() isShow: boolean;
    @Input() isDisabled: boolean;
    @Input() isShowKeyword: boolean;
    @Input() isShowTodo: boolean;
    @Input() currentPage = 0;
    @Input() totalPage = 0;
    @Input() documentName: string;
    @Input() documentType: string;
    @Input() readonly: boolean;
    @Input() isDetailPage: boolean;

    //Output
    @Output() onChangePageNumber: EventEmitter<any> = new EventEmitter();

    // public
    public documentTodos = '';
    public documentKeyword = '';
    public documentPath = '';
    public originalName = '';
    // private
    // subscribe
    documentTodoSubscription: Subscription;
    documentKeywordSubscription: Subscription;
    documentFolderSubscription: Subscription;
    originalFileNameSubscription: Subscription;

    constructor(
        private ref: ChangeDetectorRef,
        private store: Store<AppState>,
        private administrationDocumentSelectors: AdministrationDocumentSelectors,
        private administrationDocumentActions: AdministrationDocumentActions,
    ) {
        // this._txtToDosChanged
        //     .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._untilDestroyed.asObservable()))
        //     .subscribe((val) => {
        //         this.documentTodos = val;
        //         this.store.dispatch(this.administrationDocumentActions.setDocumentTodo(val));
        //     });

        this._txtKeywordChanged
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((val) => {
                this.documentKeyword = val;
                this.store.dispatch(this.administrationDocumentActions.setDocumentKeyword(val));
            });

        this._txtOriginalFileNameChanged
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this._untilDestroyed.asObservable()))
            .subscribe((val) => {
                this.originalName = val;
                this.store.dispatch(this.administrationDocumentActions.setOriginalFileName(val));
            });
    }

    ngOnInit(): void {
        this.subscripteDocument();
        this.ref.reattach();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['documentName'] && !changes['documentName'].firstChange) {
            this.documentPath = this.documentType === 'Unknow' ? '' : this.documentType;
            if (!this.isDetailPage) {
                this.originalName = this.documentName;
                this.changeOriginalName(this.documentName);
            }
            this.ref.reattach();
        }
    }

    ngOnDestroy(): void {
        Uti.unsubscribe(this);
        this._untilDestroyed.next(true);
    }

    public changePageNumber(pageNumber: number) {
        this.onChangePageNumber.emit(pageNumber);
    }

    public changeTodo(value: any) {
        // if (timeOutTodo) clearTimeout(timeOutTodo);

        // this.documentTodos = value;
        // this.store.dispatch(this.administrationDocumentActions.setDocumentTodo(value));
        this._txtToDosChanged.next(value);

        // timeOutTodo = setTimeout(() => {
        // }, 350);
    }

    public changeKeyword(value: any) {
        this._txtKeywordChanged.next(value);
        // this.ref.detectChanges();
        // this.ref.markForCheck();
        // if (timeOutKeyword) clearTimeout(timeOutKeyword);

        // this.documentKeyword = value;

        // timeOutKeyword = setTimeout(() => {
        // }, 350);
    }

    public changeOriginalName(value: any) {
        // if (timeOutOriginalFileName) clearTimeout(timeOutOriginalFileName);

        this._txtOriginalFileNameChanged.next(value);
        // timeOutOriginalFileName = setTimeout(() => {
        // }, 350);
    }

    private subscripteDocument() {
        this.documentTodoSubscription = this.administrationDocumentSelectors.toDo$
            .pipe(filter((data) => data !== null))
            .subscribe((toDo: string) => {
                if (this.documentTodos !== toDo) {
                    this.documentTodos = toDo;
                }
            });
        this.documentKeywordSubscription = this.administrationDocumentSelectors.keyword$
            .pipe(filter((data) => data !== null))
            .subscribe((keyword: string) => {
                if (this.documentKeyword !== keyword) {
                    this.documentKeyword = keyword;
                }
            });

        this.originalFileNameSubscription = this.administrationDocumentSelectors.originalFileName$
            .pipe(filter((data) => data !== null))
            .subscribe((originalName: string) => {
                if (this.originalName !== originalName) {
                    this.originalName = originalName;
                }
            });

        // this.documentFolderSubscription = this.administrationDocumentSelectors
        //     .actionOfType$(AdministrationDocumentActionNames.SAVE_DOCUMENT_INTO_FOLDER)
        //     .subscribe((action: CustomAction) => {
        //         this.documentPath = action.payload.path || '';
        //     });
    }
}
