import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    OnInit,
    ChangeDetectorRef,
    HostListener,
    ViewContainerRef,
    Injector,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ModuleList } from '@app/pages/private/base';
import { CommonFormComponent } from '../../../../../xoonit-share/components/widget-dynamic-form/components/common-form/common-form.component';
import { AdministrationDocumentSelectors } from '../../../../../state-management/store/reducer';
import { DocumentMetadata } from '../../../../../xoonit-share/processing-form/interfaces/document-metadata.interface';
import { DocumentService } from '../../../../../services';
import { DynamicFormGroupDefinition } from '../../../../../models/common/form-group-definition.model';
import { FormControl, Validators } from '@angular/forms';
import { filter, takeUntil, tap } from 'rxjs/operators';
import * as moment from 'moment';
import { fromEvent, Subject } from 'rxjs';
import { BaseWidgetDynamicFormCommonAction } from '../base-widget-common-action';
import { AdministrationDocumentActionNames, AdministrationDocumentActions, CustomAction } from '@app/state-management/store/actions';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import { AppState } from '@app/state-management/store';
import { SearchResultItemModel } from '@app/models';
import { Observable } from 'rxjs';
import * as processDataReducer from '@app/state-management/store/reducer/process-data';
import { WidgetDynamicFormComponent } from '@app/xoonit-share/components/widget-dynamic-form/widget-dynamic-form.component';

enum AddonOriginalColumnNameEnum {
    IS_PAID = 'IsPaid',
    IS_TAX_RELEVANT = 'IsTaxRelevant',
    IS_GUARANTEE = 'IsGuarantee',
    IS_TO_DO = 'IsToDo',
    GUARANTEE_EXPIRYDATE = 'GuranteeExpiryDate',
    TODO_NOTES = 'ToDoNotes',
}

@Component({
    selector: 'widget-invoice-addon-v2',
    templateUrl: './widget-invoice-addon-v2.component.html',
    styleUrls: ['./widget-invoice-addon-v2.component.scss'],
})
export class WidgetInvoiceAddonV2Component
    extends BaseWidgetDynamicFormCommonAction
    implements OnInit, AfterViewInit, OnDestroy {
    private _form: CommonFormComponent;
    protected _documentMetadata: DocumentMetadata;
    public formGroupDef: DynamicFormGroupDefinition;
    private idDocument: number;
    private detachForm$: Subject<void> = new Subject<void>();
    private todoNoteElement: HTMLInputElement;
    private isClickingTodoIcon: boolean;
    public isEmpty = false;
    public idMainDocument;
    private isApprovalModule: boolean = false;

    @ViewChild('widgetDynamic') widgetDynamic: WidgetDynamicFormComponent;

    // private subscribe
    private _selectedSearchResultState$: Observable<SearchResultItemModel>;

    constructor(
        protected router: Router,
        private elementRef: ElementRef,
        private activatedRoute: ActivatedRoute,
        private changeDetectorRef: ChangeDetectorRef,
        private administrationDocumentActions: AdministrationDocumentActions,
        protected administrationSelectors: AdministrationDocumentSelectors,
        protected documentService: DocumentService,
        protected containerRef: ViewContainerRef,
        protected injector: Injector,
        private store: Store<AppState>,
        private dispatcher: ReducerManagerDispatcher,
    ) {
        super(injector, containerRef, router);
        this._selectedSearchResultState$ = store.select(
            (state) => processDataReducer.getProcessDataState(state, this.ofModule.moduleNameTrim).selectedSearchResult,
        );
    }

    ngOnInit() {
        this.isApprovalModule = this.ofModule.idSettingsGUI === ModuleList.Approval.idSettingsGUI
        this.activatedRoute.queryParamMap
            .pipe(
                tap((param) => {
                    const params = param?.['params'];
                    if (params?.['idDocument'] !== undefined) {
                        this.idDocument = param?.['params']?.['idDocument'];
                    }
                    this.getFormGroupSettings(null, this.idDocument);
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe();
    }

    ngOnDestroy() {
        super.onDestroy();
        this.detachForm$.next();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();

        this._selectedSearchResultState$
            .pipe(
                filter((selectedSearchResultState) => !!selectedSearchResultState),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((selectedSearchResultState: SearchResultItemModel) => {
                const data = selectedSearchResultState as any;
                if (!data.idMainDocument) {
                    if (this.isEmpty) {
                        this.isEmpty = false;
                        this.idMainDocument = null;
                    } else {
                        this.reset();
                    }
                }
            });

        this.dispatcher
            .pipe(
                filter(
                    (action: CustomAction) => action.type === AdministrationDocumentActionNames.GET_DOCUMENT_BY_ID_SCAN,
                ),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe((action) => {
                if (this.isEmpty) {
                    this.isEmpty = false;
                    this.idMainDocument = null;
                } else {
                    this.reset();
                }
            });
    }

    onRouteChanged(event?: NavigationEnd) {
        console.log('onRouteChanged');
    }

    public reset() {
        this.widgetDynamic?.reset();
    }

    public dynamicFormInitialized(form: CommonFormComponent) {
        this.detachForm$.next();

        this._form = form;
        const formGroup = form.getFormGroup();
        if (formGroup) {
            const isGuaranteeFormCtrl = formGroup.controls[AddonOriginalColumnNameEnum.IS_GUARANTEE] as FormControl;
            const guaranteeExpiryDateCtrl = formGroup.controls[
                AddonOriginalColumnNameEnum.GUARANTEE_EXPIRYDATE
            ] as FormControl;
            const todoNotesCtrl = formGroup.controls[AddonOriginalColumnNameEnum.TODO_NOTES] as FormControl;
            const guaranteeExpiryDateElement = (this.elementRef.nativeElement as HTMLElement).querySelector(
                `[control-key=${AddonOriginalColumnNameEnum.GUARANTEE_EXPIRYDATE}] input`,
            ) as HTMLInputElement;
            const isTodoIconElement = (this.elementRef.nativeElement as HTMLElement).querySelector(
                `[icon-control=${AddonOriginalColumnNameEnum.IS_TO_DO}]`,
            ) as HTMLInputElement;
            this.todoNoteElement = (this.elementRef.nativeElement as HTMLElement).querySelector(
                `[control-key=${AddonOriginalColumnNameEnum.TODO_NOTES}] input`,
            ) as HTMLInputElement;

            if (!isGuaranteeFormCtrl?.value) {
                this._form.setInvisibleField(AddonOriginalColumnNameEnum.GUARANTEE_EXPIRYDATE, true);
            }
            form.listenChangedOnControl(
                AddonOriginalColumnNameEnum.IS_GUARANTEE,
                (formControl: FormControl, status: boolean) => {
                    this.showHideControl(AddonOriginalColumnNameEnum.GUARANTEE_EXPIRYDATE, status);
                    if (status) {
                        guaranteeExpiryDateCtrl.setValidators([Validators.required]);
                        guaranteeExpiryDateCtrl.setErrors(
                            moment(guaranteeExpiryDateCtrl.value).isValid() ? null : { required: true },
                        );
                        if (!this.isApprovalModule) {
                            guaranteeExpiryDateElement?.focus();
                        }
                    } else {
                        guaranteeExpiryDateCtrl.setErrors(null);
                        guaranteeExpiryDateCtrl.clearValidators();
                    }
                },
            );

            const isTodoCtrl = formGroup.controls[AddonOriginalColumnNameEnum.IS_TO_DO] as FormControl;
            isTodoIconElement.style.display = 'none';
            // isTodoIconElement.title = todoNotesCtrl.value;

            if (!isTodoCtrl?.value) {
                this._form.setInvisibleField(AddonOriginalColumnNameEnum.TODO_NOTES, true);
            }
            // fromEvent(this.todoNoteElement, 'blur')
            //     .pipe(takeUntil(this.detachForm$))
            //     .subscribe((event: MouseEvent) => {
            //         this.clickOutsideNote(event.target);
            //     });

            form.listenChangedOnControl(
                AddonOriginalColumnNameEnum.IS_TO_DO,
                (formControl: FormControl, status: boolean) => {
                    this.showHideControl(AddonOriginalColumnNameEnum.TODO_NOTES, status);
                    // isTodoIconElement.style.display = status ? 'unset' : 'none';
                    if (status) {
                        this.todoNoteElement.focus();
                    } else {
                        todoNotesCtrl.reset();
                    }
                    this.store.dispatch(this.administrationDocumentActions.setIsTodoInvoiceApprovalAction(status));
                },
            );

            // form.listenChangedOnControl(
            //     AddonOriginalColumnNameEnum.TODO_NOTES,
            //     (formControl: FormControl, value: string) => {
            //         // isTodoIconElement.title = value;
            //     },
            // );

            // if Module is Approval => disabled control
            if (this.isApprovalModule) {
                form.disableForm();
            }
        }
    }

    public onControlIconClick(event) {
        if (event.config?.formControlName === AddonOriginalColumnNameEnum.IS_TO_DO) {
            this.isClickingTodoIcon = true;
            this.showHideControl(AddonOriginalColumnNameEnum.TODO_NOTES, true);
            this.todoNoteElement.focus();
        }
    }

    public showHideControl(addonOriginalColumnNameEnum: AddonOriginalColumnNameEnum, status) {
        if (status) {
            this._form.setInvisibleField(addonOriginalColumnNameEnum, false);
        } else {
            this._form.setInvisibleField(addonOriginalColumnNameEnum, true);
        }
    }

    private getFormGroupSettings(idBranch: number, idMainDocument: number) {
        this.documentService
            .getFormGroupSettings({
                idMainDocument: idMainDocument,
                idBranch: idBranch,
                methodName: 'SpAppWg001InvoiceApproval',
                object: 'AddOnFields',
            })
            .subscribe((data) => {
                this.setDynamicFormGroupDefinition(data);
            });
    }

    private setDynamicFormGroupDefinition(dynamicFormGroupDef: DynamicFormGroupDefinition) {
        this.formGroupDef = dynamicFormGroupDef;
    }

    public dataChanged(data) {
        if (data) {
        }
    }

    // @HostListener('document:click', ['$event.target'])
    // clickOutsideNote(target) {
    //     try {
    //         if (!this.todoNoteElement.contains(target) && !this.isClickingTodoIcon && !this.idDocument) {
    //             this.showHideControl(AddonOriginalColumnNameEnum.TODO_NOTES, false);
    //         }
    //         this.isClickingTodoIcon = false;
    //     } catch {}
    // }
}
