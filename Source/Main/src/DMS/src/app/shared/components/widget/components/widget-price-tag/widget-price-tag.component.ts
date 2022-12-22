import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    OnInit,
    Output,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/pages/private/base';
import { ReducerManagerDispatcher, Store } from '@ngrx/store';
import {
    every,
    filter as filterLodash,
    find,
    findIndex,
    get,
    map,
    pick,
    set,
    some,
    uniqBy,
    valuesIn,
    values,
} from 'lodash-es';
import { DocumentImageOcrService } from '@app/pages/private/modules/image-control/services';
import { CommonService, DownloadFileService, PreissChildService } from '@app/services';
import { Uti, XnErrorMessageHelper } from '@app/utilities';
import { mappingFields } from './field';
import { parseString, Builder } from 'xml2js';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ControlData } from '@app/models/control-model/control-data';
import { PopupService } from '@app/xoonit-share/components/global-popup/services/popup.service';
import { ErrorMessageTypeEnum } from '@app/app.constants';
import { AngularCsv } from 'angular-csv-ext/dist/Angular-csv';
import { AppState } from '@app/state-management/store';
import { CustomAction, PreissChildActions } from '@app/state-management/store/actions';
import { filter, takeUntil } from 'rxjs/operators';
import { IconNames } from '@app/app-icon-registry.service';

const headerToolbar = 50;
AngularCsv.prototype.formatData = function (data) {
    if (this._options.decimalseparator === 'locale' && AngularCsv.isFloat(data)) {
        return data.toLocaleString();
    }
    if (this._options.decimalseparator !== '.' && AngularCsv.isFloat(data)) {
        return data.toString().replace('.', this._options.decimalseparator);
    }
    if (typeof data === 'string') {
        if (
            this._options.quoteStrings ||
            data.indexOf(',') > -1 ||
            data.indexOf('\n') > -1 ||
            data.indexOf('\r') > -1
        ) {
            data = this._options.quoteStrings + data + this._options.quoteStrings;
        }
        return data;
    }
    if (this._options.nullToEmptyString) {
        if (!data) {
            return (data = '');
        } else {
            return data;
        }
    }
    if (typeof data === 'boolean') {
        return data ? 'TRUE' : 'FALSE';
    }
    return data;
};

@Component({
    selector: 'widget-price-tag',
    templateUrl: 'widget-price-tag.component.html',
    styleUrls: ['widget-price-tag.component.scss'],
})
export class WidgetPriceTag extends BaseComponent implements OnInit, AfterViewInit {
    public IconNamesEnum = IconNames;
    @Output() onMaximizeWidget = new EventEmitter<any>();

    @ViewChild('formUploadPriceTag') formElemRef: ElementRef;

    @ViewChild('popupPrice') popupPrice: TemplateRef<any>;
    @ViewChild('popupProperty') popupProperty: TemplateRef<any>;
    data: any;
    dataList: any[] = [];
    fileUploaded: any;
    currentIndex: number = 0;
    public ERR_MES_TYPE_ENUM = ErrorMessageTypeEnum;
    public formGroup: FormGroup;
    public formData: FormGroup;
    public acceptFileTypes = `text/xml`;

    public priceFields = {
        AB_MFK: <ControlData>{ controlName: 'AbMFK', displayName: 'Ab MFK', order: 0, defaultValue: 0 },
        KILOMETER: <ControlData>{ controlName: 'Milage', displayName: 'Kilometer', order: 1, defaultValue: '' },
        GEAR: <ControlData>{ controlName: 'IdRepPriceTagGears', displayName: 'Getriebe', order: 2, defaultValue: '' },
        FUEL: <ControlData>{ controlName: 'IdRepPriceTagFuel', displayName: 'Treibstoff', order: 3, defaultValue: '' },
        // LAST_CHECK: <ControlData>{
        //     controlName: 'LastCheck',
        //     displayName: 'Letzte Prüfung',
        //     order: 3,
        //     defaultValue: '',
        // },
        // CURRENCY: <ControlData>{
        //     controlName: 'currency',
        //     displayName: 'Währung',
        //     isRequired: true,
        //     order: 4,
        //     defaultValue: 'CHF',
        // },
        PRICE: <ControlData>{ controlName: 'PublicPriceValue', displayName: 'Preis', order: 4, defaultValue: '' },
        NEU_PRICE: <ControlData>{ controlName: 'ListPriceValue', displayName: 'Neupreis', order: 5, defaultValue: '' },
        LEASING_AB: <ControlData>{ controlName: 'LeasingRate', displayName: 'Leasing ab', order: 6, defaultValue: '' },
        LEASING_DURATION: <ControlData>{
            controlName: 'LeasingInitialPayment',
            displayName: 'Anzahlung',
            order: 7,
            defaultValue: '',
        },
        GARANTIE: <ControlData>{ controlName: 'Garantie', displayName: 'Garantie', order: 8, defaultValue: '' },
        GARANTIE_2: <ControlData>{
            controlName: 'Garantie2',
            displayName: '',
            order: 9,
            defaultValue: '',
        },

        // LEASING_MILEAGE_COSTS: <ControlData>{
        //     controlName: 'LeasingExcessMileageCosts',
        //     displayName: 'Leasing Mileage Cost',
        //     order: 9,
        //     defaultValue: '',
        // },
    };

    public currencyOptions = [{ idValue: 'CHF', textValue: 'CHF' }];
    public fuelOptions = [];
    public gearOptions = [];
    isHover: any = {};
    isFocus: any = {};
    controlDataList: any = [];
    private _params: any;
    duplicateItems: any[] = [];
    isCheckAll: boolean;
    indeterminate: any;
    zoom = 1;
    isFullScreen: boolean;

    constructor(
        protected router: Router,
        protected xnErrorMessageHelper: XnErrorMessageHelper,
        private store: Store<AppState>,
        private element: ElementRef,
        private dispatcher: ReducerManagerDispatcher,

        private _downloadFileService: DownloadFileService,
        private preisssChildService: PreissChildService,
        private documentService: DocumentImageOcrService,
        private formBuilder: FormBuilder,
        private ref: ChangeDetectorRef,
        private popupService: PopupService,
        private preissChildAction: PreissChildActions,
        private activatedRoute: ActivatedRoute,
        private commonService: CommonService,
    ) {
        super(router);
        this.buildForm();
        this.activatedRoute.queryParams.pipe(takeUntil(this.getUnsubscriberNotifier())).subscribe((param) => {
            this._params = param;
            if (param?.idPriceTag) {
                if (param.isDelete) {
                    const idPriceTags = param.idPriceTag.split(',');
                    this.dataList = this.dataList.filter((_d) => idPriceTags.includes(_d.info?.IdPriceTag));
                    this.onChangeIndex(this.currentIndex);

                    return;
                }
                // Incase user want add more car to UI. The list will not reset
                if (!param.isAdd) {
                    this.dataList = [];
                }
                this._getPriceTagById(!param.isAdd);
            }
        });
    }

    private buildForm() {
        this.formGroup = this.formBuilder.group({
            files: [null, Validators.required],
        });
    }

    ngOnInit() {
        this.onSubscribe();
        this.commonService.getListComboBox('PriceTagFuel,PriceTagGears').subscribe((res) => {
            this.fuelOptions = get(res, ['item', 'PriceTagFuel'], []).map((_r) => ({
                ..._r,
                idValue: parseInt(_r.idValue),
            }));
            this.gearOptions = get(res, ['item', 'PriceTagGears'], []).map((_r) => ({
                ..._r,
                idValue: parseInt(_r.idValue),
            }));
        });
    }

    ngOnDestroy() {
        super.onDestroy();
    }

    ngAfterViewInit() {
        const formElem = document.getElementById('xml-upload-zone');
        if (!formElem) return;

        'drag dragstart'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        'dragenter dragover'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();

                formElem.classList.add('is-dragging-over');
            });
        });

        'dragleave dragend'.split(' ').forEach((eventName) => {
            formElem.addEventListener(eventName, (e: DragEvent) => {
                e.preventDefault();
                e.stopPropagation();

                formElem.classList.remove('is-dragging-over');
            });
        });

        formElem.addEventListener('drop', (e: DragEvent) => {
            const droppedFiles = e.dataTransfer.files;
            formElem.classList.remove('is-dragging-over');

            this.dropFiles(droppedFiles);
        });
    }

    private onSubscribe() {
        this.dispatcher
            .pipe(
                filter((action: CustomAction) => {
                    return action.type === PreissChildActions.GALLERY_PICTURE_FINISH_LOAD;
                }),
                takeUntil(this.getUnsubscriberNotifier()),
            )
            .subscribe(() => {
                this.store.dispatch(this.preissChildAction.selectItem(this.data));
            });
    }

    public expandWidget(event) {
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }

    public onFileChange($event: Event) {
        const inputElem = $event.target as HTMLInputElement;
        this.dropFiles(inputElem.files);
    }

    public openFilesDialog($event: MouseEvent) {
        $event.stopPropagation();
        $event.preventDefault();
        const input = this.formElemRef.nativeElement.querySelector('input#xml-files') as HTMLInputElement;

        // clear previous file even though it's the same one
        // if remove this line so that you can't import the same previous one
        input.value = '';
        input.click();
    }

    public dropFiles(files: any) {
        files = Array.from(files).filter((_f: any) => Uti.getFileExtension(_f.name).match(/(xml)$/i));
        if (!files || !files.length) {
            this.data = null;
            this.dataList = [];
            this.fileUploaded = null;
            return;
        }
        const reader = new FileReader();
        reader.readAsText(files[0], 'ISO-8859-1');
        reader.onloadend = (evt) => {
            const readerData = evt.target.result;
            parseString(readerData, (err, text) => {
                const dataList = get(text, ['Export', 'FZ', 0, 'TYP'], []).map((_d) => ({
                    origin: _d,
                    property: this.parseData(_d),
                }));
                this.dataList = dataList;
                this.fileUploaded = files[0];
                this.onChangeIndex(0);
                this._confirmSaveData();
                this.ref.detectChanges();
            });
        };
        // this.files = Array.from(files).filter((_f: any) => Uti.getFileExtension(_f.name).match(/(xml)$/i));
    }
    private _confirmSaveData() {
        const popoverRef = this.popupService.open({
            content: `There are ${this.dataList.length} car in this file, do you want to save these car?`,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Confirmation',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'No', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'Yes',
                        buttonType: 'flat',
                        onClick: (() => {
                            this.dataList.forEach((_d, i) => {
                                var builder = new Builder();
                                var xml = builder.buildObject(_d.origin);
                                const params = {
                                    JSONPriceTag: {
                                        PriceTag: [
                                            {
                                                IdPriceTag: null,
                                                ChassisNr: _d.property.ChassisNr,
                                                TYPFZGNR: _d.property['car.vin'],
                                                CarName: _d.property['car.name'],
                                                IsActive: 1,
                                                IsDelete: 0,
                                                IsImport: 1,
                                            },
                                        ],
                                    },
                                    JSONPriceTagXML: {
                                        PriceTagXML: [
                                            {
                                                IdPriceTagXML: null,
                                                IdPriceTag: null,
                                                XML: xml,
                                                IsActive: 1,
                                                IsDelete: 0,
                                            },
                                        ],
                                    },
                                    JSONPriceTagEquipment: {
                                        PriceTagEquipment: [
                                            {
                                                IdPriceTagEquipment: null,
                                                IdPriceTag: null,
                                                Equipment: JSON.stringify({
                                                    StandardEquipment: _d.property.StandardEquipment,
                                                    SpecialEquipment: _d.property.SpecialEquipment,
                                                }),
                                                IsActive: 1,
                                                IsDelete: 0,
                                            },
                                        ],
                                    },
                                    JSONPriceTagEditFields: {
                                        PriceTagEditFields: [
                                            {
                                                IdPriceTagEditFields: null,
                                                IdPriceTag: null,
                                                Fuel: get(_d, 'property.Fuel', ''),
                                                IdRepPriceTagFuel: get(_d, 'property.IdRepPriceTagFuel', ''),
                                                IdRepPriceTagGears: get(_d, 'property.IdRepPriceTagGears', ''),
                                                Kilometer: get(_d, 'property.Milage', ''),

                                                AbMFK: get(_d, 'property.AbMFK') ? 1 : 0,
                                                // LastCheck: this.parseValueToDate(get(_d, 'property.LastCheck', '')),
                                                LeasingAsof: get(_d, 'property.LeasingRate', 0),
                                                Price: get(_d, 'property.PublicPriceValue', 0),
                                                NewPrice: get(_d, 'property.ListPriceValue', 0),
                                                Garantie: get(_d, 'property.Garantie', ''),
                                                Garantie2: get(_d, 'property.Garantie2', ''),

                                                LeasingInitialPayment: get(_d, 'property.LeasingInitialPayment', 0),
                                                // LeasingDuration: get(_d, 'property.LeasingDuration', 0),
                                                // LeasingMileageCosts: get(_d, 'property.LeasingExcessMileageCosts', 0),
                                                Notes: '',
                                                IsActive: 1,
                                                IsDelete: 0,
                                            },
                                        ],
                                    },
                                };
                                this.preisssChildService.createPriceTag(params).subscribe((res) => {
                                    if (!!res.item.returnID && res.item.returnID != '-1')
                                        this.preisssChildService
                                            .getPriceTag(res.item.returnID)
                                            .subscribe((response) => {
                                                const info = get(response, ['item', 0, 0], {});
                                                _d.info = this.getInformation(info);
                                                set(_d, 'property.LeasingRate', info.LeasingAsof);
                                                // set(_d, 'property.LeasingDuration', info.LeasingDuration);
                                                // set(_d, 'property.LeasingExcessMileageCosts', info.LeasingMileageCosts);
                                                set(_d, 'property.Fuel', info.Fuel);
                                                set(_d, 'property.IdRepPriceTagFuel', info.IdRepPriceTagFuel);
                                                set(_d, 'property.IdRepPriceTagGears', info.IdRepPriceTagGears);
                                                set(_d, 'property.Milage', info.Kilometer);

                                                set(_d, 'property.AbMFK', info.AbMFK == 1 ? true : false);
                                                // set(_d, 'property.LastCheck', info.LastCheck);
                                                set(_d, 'property.LeasingInitialPayment', info.LeasingInitialPayment);
                                                set(_d, 'property.ListPriceValue', info.NewPrice);
                                                set(_d, 'property.Garantie', info.Garantie);
                                                set(_d, 'property.Garantie2', info.Garantie2);

                                                set(_d, 'property.PublicPriceValue', info.Price);
                                                parseString(info.XML, (err, text) => {
                                                    set(_d, 'origin', text.root);
                                                });
                                                if (this.currentIndex === i) this.onChangeIndex(this.currentIndex);
                                                try {
                                                    const { StandardEquipment, SpecialEquipment } = JSON.parse(
                                                        info.Equipment,
                                                    );
                                                    set(_d, 'property.StandardEquipment', StandardEquipment);
                                                    set(_d, 'property.SpecialEquipment', SpecialEquipment);
                                                } catch (error) {}
                                            });
                                });
                            });
                            popoverRef.close();
                        }).bind(this),
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }

    public print() {
        let printContents, popupWin;
        const stylesHtml = this.getTagsHtml('style');
        const linksHtml = this.getTagsHtml('link');
        printContents = document.getElementById('print-section').innerHTML;
        const origin = window.location.origin;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`
      <html>
        <head>
          <title>Print tab</title>
          <style>
          ${linksHtml}
          ${stylesHtml}
          <style>
          @font-face {font-family: "rbt_Regular"; src: url("${origin}/SFProDisplay-Regular.d09549c1ab4a5947a007.ttf") format("truetype"); };
          </style>
          </style>
        </head>
    <body onload="setTimeout(() => {window.print(); window.close();},350);">${printContents}</body>
      </html>`);
        popupWin.document.close();
    }

    public refresh() {
        this.dataList = [];
        this.currentIndex = 0;
        this.data = null;
        this.router.navigate(['/PreissChild'], {
            queryParams: { idPriceTag: null, isAdd: null, t: null },
            queryParamsHandling: 'merge',
        });
    }

    public changeZoom(event) {
        this.zoom = event.value;
    }

    private getTagsHtml(tagName: keyof HTMLElementTagNameMap): string {
        const htmlStr: string[] = [];
        const elements = document.getElementsByTagName(tagName);
        for (let idx = 0; idx < elements.length; idx++) {
            htmlStr.push(elements[idx].outerHTML);
        }

        return htmlStr.join('\r\n');
    }

    public getUIValue = (field, defaultValue = '') => {
        return get(this.data, ['property', field], defaultValue) || defaultValue;
    };

    public getValuePropertyField = (name) => {
        return map(filterLodash(get(this.data, ['property', name], []), 'checked'), 'value');
    };

    public getUINumber = (field) => {
        try {
            let val = parseInt(get(this.data, ['property', field]) || '0');

            return this.parseValueToNumber(val);
        } catch (error) {
            return 0;
        }
    };
    private parseValueToNumber(value) {
        return value.toLocaleString('de-DE').split('.').join("'").replace(',', '.');
    }

    public getUIDate = (field, defaultValue = '') => {
        try {
            let val = get(this.data, ['property', field], defaultValue) || defaultValue;

            return !!val ? this.parseValueToDate(val) : '';
        } catch (error) {
            return '';
        }
    };

    public getUIBoolean = (field, defaultValue = '') => {
        try {
            let val = get(this.data, ['property', field], defaultValue) || defaultValue;

            return !!val ? 'Ja' : 'Nein';
        } catch (error) {
            return '';
        }
    };

    private parseValueToDate(value) {
        const year = value?.substring(0, 4);
        const month = value?.substring(4, 6);
        const day = value?.substring(6);
        return `${day}.${month}.${year}`;
    }

    public getUIDate2 = (field, defaultValue = '') => {
        try {
            let val = get(this.data, ['property', field], defaultValue) || defaultValue;

            return !!val ? this.parseValueToDate(val) : '';
        } catch (error) {
            return '';
        }
    };

    private parseValueToDate2(value) {
        try {
            const d = new Date(value);
            return d.toLocaleDateString('fr-CH');
        } catch (error) {
            return value;
        }
    }

    public getUIPrice = (field) => {
        try {
            let val = parseInt(get(this.data, ['property', field]) || '0');
            return this.parseValueToPrice(val);
        } catch (error) {
            return 0;
        }
    };
    private parseValueToPrice(value) {
        return value.toLocaleString('de-DE').split('.').join("'").replace(',', '.') + '.-';
    }

    private parseData(data) {
        const property = {};
        let totalArr = 0;
        for (const key in mappingFields) {
            if (Object.hasOwnProperty.call(mappingFields, key)) {
                const field = mappingFields[key];
                const defaultVal = field.defaultVal ?? '';
                switch (field.type) {
                    case 'attribute':
                        property[field.xlsx] = get(data, field.xml, defaultVal) + '2';
                        break;

                    case 'multiple':
                        if (Array.isArray(field.xml))
                            property[field.xlsx] = field.xml.map((_f) => get(data, _f), '').join(' ');

                        break;
                    case 'array':
                        property[field.xlsx] = filterLodash(
                            uniqBy(
                                map(get(data, field.xml, []), 'SAPTEXT.0._').map((_t) => {
                                    totalArr += 1;
                                    return {
                                        value: _t,
                                        checked: totalArr <= 15,
                                    };
                                }),
                                'value',
                            ),
                            (_d) => !!_d.value,
                        );
                        break;
                    case 'picture':
                        property[field.xlsx] = map(get(data, field.xml, []), '_');
                        break;
                    default:
                        property[field.xlsx] = get(data, field.xml + '.0', defaultVal);
                        break;
                }
            }
        }

        return property;
    }

    public onChangeIndex(newIndex) {
        this.currentIndex = this.dataList.length ? Math.min(Math.max(newIndex, 0), this.dataList.length - 1) : 0;
        this.data = this.dataList[this.currentIndex];

        this.store.dispatch(this.preissChildAction.selectItem(this.data));
    }

    public download() {
        let response = [];
        const header = [];
        for (const key in mappingFields) {
            if (Object.hasOwnProperty.call(mappingFields, key)) {
                const element = mappingFields[key];
                if (element.hidden) continue;
                if (element.xlsx) header.push(element.xlsx);
            }
        }
        response.unshift(header);
        this.dataList.forEach((_d) => {
            const row = [];
            for (const key in mappingFields) {
                if (Object.hasOwnProperty.call(mappingFields, key)) {
                    const element = mappingFields[key];
                    if (element.hidden) continue;
                    if (element.xlsx) {
                        let tempValue = get(_d, ['property', element.xlsx]) || '';

                        switch (element.xlsx) {
                            case 'car.external_id':
                                tempValue = get(_d, ['info', 'IdPriceTag']) || '';
                                break;
                            case 'GearType':
                                const value = get(_d, ['property', 'IdRepPriceTagGears']);
                                if (value) tempValue = find(this.gearOptions, ['idValue', value])?.textValue;
                                else tempValue = '';

                                break;

                            case 'PrimaryFuelType':
                            case 'Fuel':
                                const valueFuel = get(_d, ['property', 'IdRepPriceTagFuel']);
                                if (valueFuel) tempValue = find(this.fuelOptions, ['idValue', valueFuel])?.textValue;
                                else tempValue = '';

                                break;

                            case 'Milage':
                                tempValue = get(_d, ['property', 'Milage']) || 0;
                                tempValue = Number(tempValue) || 0;
                                tempValue = this.parseValueToNumber(tempValue);
                                break;

                            case 'AbMFK':
                                // date DD.MM.YYYY
                                tempValue = this.getUIBoolean(tempValue);
                                break;
                            case 'LastCheck':
                                tempValue = this.parseValueToDate2(tempValue);

                                break;
                            case 'InitialRegistration':
                                // date DD.MM.YYYY
                                tempValue = this.parseValueToDate(tempValue);
                                break;
                            case 'EngineCapacity':
                                // number seperate with (.  - thousand
                                tempValue = Number(tempValue) || 0;
                                tempValue = this.parseValueToNumber(tempValue);
                                break;
                            case 'LeasingExcessMileageCosts':
                            case 'LeasingInitialPayment':
                            case 'PublicPriceValue':
                            case 'ListPriceValue':
                            case 'LeasingRate':
                                // currency seperate with (' - thousand) and (. - decimal)
                                tempValue = Number(tempValue) || 0;
                                tempValue = this.parseValueToPrice(tempValue);
                                break;
                            case 'StandardEquipment':
                                let specialEquipment = map(
                                    filterLodash(get(_d, ['property', 'SpecialEquipment'], []), 'checked'),
                                    'value',
                                ).join('\n');
                                if (specialEquipment.length) specialEquipment = '\n' + specialEquipment;
                                tempValue = `"${map(
                                    filterLodash(get(_d, ['property', 'StandardEquipment'], []), 'checked'),
                                    'value',
                                ).join('\n')}${specialEquipment}"`;
                                break;
                            case 'SpecialEquipment':
                                tempValue = `"${map(
                                    filterLodash(get(_d, ['property', 'SpecialEquipment'], []), 'checked'),
                                    'value',
                                ).join('\n')}"`;
                                break;
                            case 'LeasingDuration':
                            case 'WarrantyDuration':
                                // int
                                tempValue = Number(tempValue) || 0;
                                break;
                            case 'WarrantyText':
                                tempValue = get(_d, ['property', 'Garantie']) || '';
                                break;
                            case 'WarrantyMilage':
                                tempValue = get(_d, ['property', 'Garantie2']) || '';
                                break;
                            case 'BodyColor':
                            case 'Covering':
                                // string
                                tempValue = tempValue?.toString() || '';
                                break;
                            default:
                                break;
                        }
                        row.push(tempValue);
                    }
                }
            }
            response.push(row);
        });
        const fileName = this.fileUploaded?.name?.replace(/\.[a-zA-Z0-9\s\w\W]+/gi, '') || 'export';
        new AngularCsv(response, fileName, {
            quoteStrings: '',
            fieldSeparator: ';',
            useBom: false,
        });
    }

    public openEditPriceDialog() {
        const initForm = this.formBuilder.group({});
        this.controlDataList = [];
        for (const key in this.priceFields) {
            if (Object.prototype.hasOwnProperty.call(this.priceFields, key)) {
                const element = this.priceFields[key];
                this.controlDataList.push(element);
            }
        }
        this.controlDataList.forEach((element: ControlData) => {
            // add to hover and focus
            this.isFocus[element.controlName] = false;
            this.isHover[element.controlName] = false;

            // new control and set validation
            const control = new FormControl(get(this.data, ['property', element.controlName], element.defaultValue));
            const validatorList = [];
            if (element.isRequired) {
                validatorList.push(Validators.required);
            }
            if (element.pattern) {
                validatorList.push(Validators.pattern(element.pattern));
            }
            control.setValidators(validatorList);
            initForm.addControl(element.controlName, control);
        });
        this.formData = initForm;
        const popoverRef = this.popupService.open({
            content: this.popupPrice,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Daten bearbeiten',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'Abbrechen', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'OK',
                        buttonType: 'flat',
                        onClick: () => {
                            const rawValues = this.formData.getRawValue();
                            for (const key in rawValues) {
                                if (Object.prototype.hasOwnProperty.call(rawValues, key)) {
                                    const value = rawValues[key];
                                    const fieldXml = find(mappingFields, ['xlsx', key]);
                                    if (fieldXml?.xml && fieldXml.xml !== 'EMPTY_NEED_WRITE')
                                        set(this.dataList, `${this.currentIndex}.origin.${fieldXml.xml}.0`, value);
                                    set(this.dataList, `${this.currentIndex}.property.${key}`, value);
                                }
                            }
                            this._updatePriceTagProperty();
                            popoverRef.close();
                        },
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }

    public openEditPropertyDialog() {
        const initForm = this.formBuilder.group({});
        this.controlDataList = [];
        let count = 0;
        this.data?.property.StandardEquipment.forEach((element) => {
            const name = 'StandardEquipment.' + this.controlDataList.length;
            this.controlDataList.push({
                controlName: name,
                displayName: element.value,
                defaultValue: element.checked,
                type: 1,
            });
            if (element.checked) count += 1;
            const control = new FormControl(element.checked);
            control.valueChanges.subscribe(() => {
                this.isCheckAll = this.getCurrentEditProperty() >= 15;
                this.indeterminate = !this.isCheckAll && some(values(this.formData.getRawValue()), Boolean);
            });
            initForm.addControl(name, control);
        });

        this.data?.property.SpecialEquipment.forEach((element, i) => {
            const name = 'SpecialEquipment.' + i;
            this.controlDataList.push({
                controlName: name,
                displayName: element.value,
                defaultValue: element.checked,
                type: 2,
            });
            if (element.checked) count += 1;
            const control = new FormControl(element.checked);
            control.valueChanges.subscribe(() => {
                this.isCheckAll = this.getCurrentEditProperty() >= 15;
                this.indeterminate = !this.isCheckAll && some(values(this.formData.getRawValue()), Boolean);
            });
            initForm.addControl(name, control);
        });

        this.isCheckAll = count >= 15;
        this.indeterminate = !this.isCheckAll && count > 0;
        this.formData = initForm;
        const popoverRef = this.popupService.open({
            content: this.popupProperty,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Ausstattung bearbeiten',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'Abbrechen', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'OK',
                        buttonType: 'flat',
                        onClick: (data?: any) => {
                            const rawValues = this.formData.getRawValue();
                            for (const key in rawValues) {
                                if (Object.prototype.hasOwnProperty.call(rawValues, key)) {
                                    const checked = rawValues[key];
                                    const i = key.split('.')[1];
                                    const fieldXml = find(mappingFields, ['xlsx', key]);
                                    set(this.dataList, `${this.currentIndex}.property.${key}.checked`, checked);
                                    set(this.dataList, `${this.currentIndex}.origin.${fieldXml}.${i}.HIDDEN`, [
                                        !checked ? '1' : '',
                                    ]);
                                }
                            }
                            this._updatePriceTagProperty();
                            popoverRef.close();
                        },
                    },
                ],
            },
            disableCloseOutside: true,
        });
        this.ref.detectChanges();
    }

    public setAll(checked: boolean) {
        this.isCheckAll = checked;
        if (checked) {
            this.controlDataList.forEach((control) => {
                let current = this.getCurrentEditProperty();
                if (current < 15) this.formData.controls[control.controlName].setValue(checked);
            });
        } else
            this.controlDataList.forEach((control) => {
                this.formData.controls[control.controlName].setValue(checked);
            });
    }

    private _updatePriceTagProperty() {
        var builder = new Builder();
        var xml = builder.buildObject(get(this.dataList, [this.currentIndex, 'origin']));
        const params = {
            JSONPriceTag: {
                PriceTag: [
                    {
                        IdPriceTag: this.data.info?.IdPriceTag || null,
                        ChassisNr: get(this.dataList, [this.currentIndex, 'property', 'ChassisNr'], ''),
                        TYPFZGNR: get(this.dataList, [this.currentIndex, 'property', 'car.vin'], ''),
                        CarName: get(this.dataList, [this.currentIndex, 'property', 'car.name'], ''),
                        IsActive: 1,
                        IsDelete: 0,
                        IsImport: 1,
                    },
                ],
            },
            JSONPriceTagXML: {
                PriceTagXML: [
                    {
                        IdPriceTagXML: this.data.info?.IdPriceTagXML || null,
                        IdPriceTag: this.data.info?.IdPriceTag || null,
                        XML: xml,
                        IsActive: 1,
                        IsDelete: 0,
                    },
                ],
            },
            JSONPriceTagEditFields: {
                PriceTagEditFields: [
                    {
                        IdPriceTagEditFields: this.data.info?.IdPriceTagEditFields || null,
                        IdPriceTag: this.data.info?.IdPriceTag || null,
                        Fuel: get(this.dataList, [this.currentIndex, 'property', 'Fuel'], ''),
                        IdRepPriceTagFuel: get(this.dataList, [this.currentIndex, 'property', 'IdRepPriceTagFuel'], ''),
                        IdRepPriceTagGears: get(
                            this.dataList,
                            [this.currentIndex, 'property', 'IdRepPriceTagGears'],
                            '',
                        ),
                        Kilometer: get(this.dataList, [this.currentIndex, 'property', 'Milage'], ''),

                        AbMFK: get(this.dataList, [this.currentIndex, 'property', 'AbMFK'], false) ? 1 : 0,
                        // LastCheck: get(this.dataList, [this.currentIndex, 'property', 'LastCheck'], ''),
                        LeasingAsof: get(this.dataList, [this.currentIndex, 'property', 'LeasingRate'], 0),
                        Price: get(this.dataList, [this.currentIndex, 'property', 'PublicPriceValue'], 0),
                        NewPrice: get(this.dataList, [this.currentIndex, 'property', 'ListPriceValue'], 0),
                        Garantie: get(this.dataList, [this.currentIndex, 'property', 'Garantie'], ''),
                        Garantie2: get(this.dataList, [this.currentIndex, 'property', 'Garantie2'], ''),
                        LeasingInitialPayment: get(
                            this.dataList,
                            [this.currentIndex, 'property', 'LeasingInitialPayment'],
                            0,
                        ),
                        // LeasingDuration: get(this.dataList, [this.currentIndex, 'property', 'LeasingDuration'], 0),
                        // LeasingMileageCosts: get(
                        //     this.dataList,
                        //     [this.currentIndex, 'property', 'LeasingExcessMileageCosts'],
                        //     0,
                        // ),
                        Notes: '',
                        IsActive: 1,
                        IsDelete: 0,
                    },
                ],
            },
            JSONPriceTagEquipment: {
                PriceTagEquipment: [
                    {
                        IdPriceTagEquipment: this.data.info?.IdPriceTagEquipment || null,
                        IdPriceTag: this.data.info?.IdPriceTag || null,
                        Equipment: JSON.stringify({
                            StandardEquipment: get(this.dataList, [this.currentIndex, 'property', 'StandardEquipment']),
                            SpecialEquipment: get(this.dataList, [this.currentIndex, 'property', 'SpecialEquipment']),
                        }),
                        IsActive: 1,
                        IsDelete: 0,
                    },
                ],
            },
        };
        this.preisssChildService.createPriceTag(params).subscribe((res) => {
            if (!this.data.info?.IdPriceTag && !!res.item.returnID && res.item.returnID != '-1')
                this.preisssChildService.getPriceTag(res.item.returnID).subscribe((response) => {
                    set(
                        this.dataList,
                        `${this.currentIndex}.info`,
                        this.getInformation(get(response, ['item', 0, 0], {})),
                    );
                    this.onChangeIndex(this.currentIndex);
                    this._updatePriceTagProperty();
                });
        });
    }

    //#region Handle form
    public changeValueHover(controlName: string, value: () => boolean) {
        if (!controlName) return;

        this.isHover[controlName] = value;
    }
    public changeValueFocus(controlName: string, value: () => boolean) {
        if (!controlName) return;

        this.isFocus[controlName] = value;
    }
    public clearText(controlName: string) {
        if (!controlName) return;

        this.formData.controls[controlName].setValue('');
    }

    fullscreenAction() {
        this.isFullScreen = !this.isFullScreen;
        this.onMaximizeWidget.emit({
            isMaximized: this.isFullScreen,
        });
    }

    //#end region
    private _getPriceTagById(reset: boolean) {
        const idPriceTags = this._params.idPriceTag.split(',');
        this.duplicateItems = [];
        let count = 0;
        for (const key in idPriceTags) {
            if (Object.prototype.hasOwnProperty.call(idPriceTags, key)) {
                const idPriceTag = idPriceTags[key];
                const index = findIndex(this.dataList, (_d) => _d?.info?.IdPriceTag == idPriceTag);
                if (index > -1) {
                    count += 1;
                    // this.onChangeIndex(index);
                    continue;
                }
                this.preisssChildService.getPriceTag(idPriceTag).subscribe((res) => {
                    const data = get(res, ['item', 0, 0]);
                    if (!data) {
                        this.onChangeIndex(this.currentIndex);

                        return;
                    }
                    parseString(data.XML, (err, text) => {
                        const _d = {
                            info: this.getInformation(data),
                            origin: text.root,
                            property: this.parseData(text.root),
                        };
                        set(_d, 'property.LeasingRate', data.LeasingAsof);
                        // set(_d, 'property.LeasingDuration', data.LeasingDuration);
                        // set(_d, 'property.LeasingExcessMileageCosts', data.LeasingMileageCosts);
                        set(_d, 'property.Fuel', data.Fuel);
                        set(_d, 'property.IdRepPriceTagFuel', data.IdRepPriceTagFuel);
                        set(_d, 'property.IdRepPriceTagGears', data.IdRepPriceTagGears);
                        set(_d, 'property.Milage', data.Kilometer);
                        set(_d, 'property.AbMFK', data.AbMFK == 1 ? true : false);
                        // set(_d, 'property.LastCheck', data.LastCheck);
                        set(_d, 'property.LeasingInitialPayment', data.LeasingInitialPayment);

                        set(_d, 'property.ListPriceValue', data.NewPrice);
                        set(_d, 'property.Garantie', data.Garantie);
                        set(_d, 'property.Garantie2', data.Garantie2);
                        set(_d, 'property.PublicPriceValue', data.Price);
                        count += 1;

                        try {
                            const { StandardEquipment, SpecialEquipment } = JSON.parse(data.Equipment);
                            set(_d, 'property.StandardEquipment', StandardEquipment);
                            set(_d, 'property.SpecialEquipment', SpecialEquipment);
                        } catch (error) {}
                        const isDuplicateName =
                            findIndex(
                                this.dataList,
                                (_item) =>
                                    !_item.info?.IdPriceTag && _item.property['car.name'] === _d.property['car.name'],
                            ) > -1;
                        if (!isDuplicateName) {
                            this.dataList.push(_d);
                            // this.onChangeIndex(this.dataList.length - 1);
                        } else {
                            this.duplicateItems.push(_d);
                        }
                        if (count === idPriceTags.length) this.onChangeIndex(reset ? 0 : this.currentIndex);
                        if (count === idPriceTags.length && this.duplicateItems.length) {
                            this._openConfirmReplace();
                        }
                    });
                });
            }
        }
    }
    private _openConfirmReplace() {
        const popoverRef = this.popupService.open({
            content: `There are ${this.duplicateItems.length} car found in system, do you want to replace these car?`,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Confirmation',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'No', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'Yes',
                        buttonType: 'flat',
                        onClick: (() => {
                            this.duplicateItems.forEach((_d, i) => {
                                const index = findIndex(
                                    this.dataList,
                                    (_item) =>
                                        !_item.info?.IdPriceTag &&
                                        _item.property['car.name'] === _d.property['car.name'],
                                );
                                if (index > -1) {
                                    this.dataList[index] = _d;
                                    if (i === this.duplicateItems.length - 1) this.onChangeIndex(index);
                                }
                            });
                            this.duplicateItems = [];
                            popoverRef.close();
                        }).bind(this),
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }

    private getInformation(info) {
        return pick(info, ['IdPriceTag', 'IdPriceTagEditFields', 'IdPriceTagEquipment', 'IdPriceTagXML']);
    }

    getProperty() {
        const standard: string[] = this.getValuePropertyField('StandardEquipment');
        const special: string[] = this.getValuePropertyField('SpecialEquipment');

        return [...standard, ...special];
    }

    getCurrentEditProperty() {
        if (!this.formData) return 0;
        const rawValues = this.formData.getRawValue();

        return valuesIn(rawValues)?.filter((_r) => _r).length;
    }

    getFuelValue(field) {
        const value = get(this.data, ['property', field]);
        if (!value) return '';
        return find(this.fuelOptions, ['idValue', value])?.textValue;
    }

    getGearValue(field) {
        const value = get(this.data, ['property', field]);
        if (!value) return '';
        return find(this.gearOptions, ['idValue', value])?.textValue;
    }

    deletePriceTag() {
        if (!this.data?.info?.IdPriceTag) return;
        const popoverRef = this.popupService.open({
            content: `Are you sure you want delete this car?`,
            width: 600,
            hasBackdrop: true,
            header: {
                title: 'Confirmation',
                iconClose: true,
            },
            footer: {
                justifyContent: 'full',
                buttons: [
                    { color: '', text: 'No', buttonType: 'flat', onClick: () => popoverRef.close() },
                    {
                        color: 'primary',
                        text: 'Yes',
                        buttonType: 'flat',
                        onClick: (() => {
                            this.preisssChildService
                                .deletePriceTag({ IdPriceTag: this.data?.info?.IdPriceTag })
                                .subscribe((res) => {
                                    this.dataList = this.dataList.filter(
                                        (_d) => _d.info?.IdPriceTag !== this.data?.info?.IdPriceTag,
                                    );
                                    this.onChangeIndex(this.currentIndex);
                                    popoverRef.close();
                                });
                        }).bind(this),
                    },
                ],
            },
            disableCloseOutside: true,
        });
    }
}
