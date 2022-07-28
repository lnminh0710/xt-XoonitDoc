import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Country } from '@app/models/country.model';
import { WidgetDetail } from '@app/models';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import isNumber from 'lodash-es/isNumber';
import isBoolean from 'lodash-es/isBoolean';
import isNil from 'lodash-es/isNil';
import { searchResultReducer } from '../../../../state-management/store/reducer';
import { Uti } from '@app/utilities';

@Component({
    selector: 'xn-country-check-list',
    styleUrls: ['./country-check-list.component.scss'],
    templateUrl: './country-check-list.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class XnCountryCheckListComponent implements OnInit, OnDestroy {
    public isRendered = false;
    public mainList: Array<Country[]> = [];
    public subList: Array<Country[]> = [];
    public viewModeMainList: Array<Country[]> = [];
    public viewModeSubList: Array<Country[]> = [];
    public doesCountryHaveOneCheckedValue = true;

    private defaultRowNo = 5;
    public defaulWidthColumn = 270;
    private isShowedSubList = false;
    private perfectScrollbarConfig: any = {};
    private idSelectAllMain = -1;
    private idSelectAllSecondary = -2;
    private selectedAllMainModel: Country;
    private selectedAllSecondaryModel: Country;

    private outDataCountries: Country[] = [];
    private isCountryModel = true;
    private _isRadioButtonMode = false;

    private randonNr: number = (new Date()).getTime();

    @Input() editMode = true;

    // data structure: {mainList:[],subList:[]}
    @Input() set data(data: any) {
        setTimeout(() => {
            this.initCountriesData(data);
            this.randonNr = (new Date()).getTime();
            this.checkValueWhenRadioMode(data);
            this.ref.markForCheck();
            this.isCompletedRender.emit();
        }, 200);
    }

    @Input() set widgetDetail(data: WidgetDetail) {
        if (!data || !data.contentDetail) {
            return;
        }
        if (!data.contentDetail.data && data.contentDetail.data.length < 1) {
            return;
        }
        this.editMode = false;
        let countryCheckListData = cloneDeep(data.contentDetail.data[1]);
        this.data = countryCheckListData;
        this.ref.markForCheck();
        this.isCompletedRender.emit();
    };

    @Input() set isExpand(data: any) {
        this.showSubList(!!data);
        this.ref.markForCheck();
    }

    @Input() set edit(eventdata: any) {
        if (!eventdata)
            return;
        setTimeout(() => {
            if (eventdata.data)
                this.initCountriesData(eventdata.data);
            this.editMode = eventdata.editMode;
            this.ref.markForCheck();
        });
    }

    @Input() set isRadioButtonMode(isRadioButtonMode: boolean) {
        this._isRadioButtonMode = isRadioButtonMode;
        this.ref.markForCheck();
    }

    @Input() isClone: boolean;

    // If true , this form is displaying on Widget
    private _isActivated: boolean;
    @Input() set isActivated(status: boolean) {
        this._isActivated = status;
        if (!status) {
            this.ref.detach();
        }
        else {
            this.ref.reattach();
        }
    };

    get isActivated() {
        return this._isActivated;
    }

    public isFormChanged: boolean;

    @Output() outputData: EventEmitter<any> = new EventEmitter();
    @Output() noEntryDataEvent: EventEmitter<any> = new EventEmitter();
    @Output() isCompletedRender: EventEmitter<any> = new EventEmitter();

    constructor(
        private ref: ChangeDetectorRef
    ) { }

    public ngOnInit() {
        this.perfectScrollbarConfig = {
            suppressScrollX: false,
            suppressScrollY: false
        }
    }

    /**
     * setEditMode
     */
    public setEditMode(editMode: boolean) {
        this.editMode = editMode;
        if (this.editMode) {
            if ((!this.mainList || !this.mainList.length) && (!this.subList || !this.subList.length)) {
                this.noEntryDataEvent.emit(true);
            } else {
                this.noEntryDataEvent.emit(false);
            }
        } else {
            if (this.viewModeMainList && this.viewModeMainList[0] && this.viewModeMainList[0].length > 0) {
                this.noEntryDataEvent.emit(false);
            } else {
                this.noEntryDataEvent.emit(true);
            }
        }
        this.ref.markForCheck();
    }

    public resetData() {
        this.mainList.forEach((item) => {
            item.forEach(item1 => {
                if (isNil(item1.idArticleExcludeCountries) && item1.isActive) {
                    item1.isActive = false;
                } else if (!isNil(item1.idArticleExcludeCountries) && !item1.isActive) {
                    item1.isActive = true;
                }

                item1.isDirty = false;
            });
        });
        this.outDataCountries.forEach((item) => {
            if (isNil(item.idArticleExcludeCountries) && item.isActive) {
                item.isActive = false;
            } else if (!isNil(item.idArticleExcludeCountries) && !item.isActive) {
                item.isActive = true;
            }

            item.isDirty = false;
        });
        this.outputData.emit(this.outDataCountries.filter(x => x.isDirty));
    }

    public setActive(idList: Array<any>, value?: boolean, keepCurrentChecked?: boolean) {
        if (keepCurrentChecked) {
            this.mainList.forEach((item) => {
                item.forEach(item1 => {
                    if (idList.indexOf(item1.idValue) > -1) {
                        item1.isActive = !!value;
                    }
                });
            });

            this.subList.forEach((item) => {
                item.forEach(item1 => {
                    if (idList.indexOf(item1.idValue) > -1) {
                        item1.isActive = !!value;
                    }
                });
            });
        } else {
            this.mainList.forEach((item) => {
                item.forEach(item1 => {
                    item1.isActive = (idList.indexOf(item1.idValue) > -1);
                });
            });

            this.subList.forEach((item) => {
                item.forEach(item1 => {
                    item1.isActive = (idList.indexOf(item1.idValue) > -1);
                });
            });
        }
        this.ref.markForCheck();
        this.outputData.emit(this.outDataCountries.filter(x => x.isDirty));
    }

    private initCountriesData(countriesData: any) {
        if (!countriesData || !countriesData.length) {
            this.isRendered = false;
            return;
        }

        this.checkIsCountryModelType(countriesData[0]);
        const _countriesData = this.isCountryModel ? cloneDeep(countriesData) : this.mapDataToCountryModel(countriesData);
        this.outDataCountries = _countriesData;

        const mainList = _countriesData.filter(item => {
            if (isString(item.isMain) && (item.isMain as string).toLowerCase() === 'true') {
                item.isMain = true;
                return true;
            }
            if (isBoolean(item.isMain)) {
                return item.isMain;
            }
        });

        const subList = _countriesData.filter(item => {
            if (isString(item.isMain) && (item.isMain === '' || (item.isMain as string).toLowerCase() === 'false')) {
                item.isMain = false;
                return true;
            }
            if (isBoolean(item.isMain)) {
                return !item.isMain;
            }
        });

        // Edit mode
        this.selectedAllMainModel = new Country({ isoCode: null, isActive: false, isMain: true, idValue: this.idSelectAllMain, textValue: 'Select All Main' });
        const mainData = this.generateDisplayData(mainList, !this._isRadioButtonMode, this.selectedAllMainModel);
        this.mainList = mainData.list;
        this.selectedAllSecondaryModel = new Country({ isoCode: null, isActive: false, isMain: false, idValue: this.idSelectAllSecondary, textValue: 'Select All Secondary' });
        const subData = this.generateDisplayData(subList, !this._isRadioButtonMode, this.selectedAllSecondaryModel);
        this.subList = subData.list;

        // view mode
        const mainDataViewMode = this.generateDisplayData(_countriesData, false);
        this.viewModeMainList = mainDataViewMode.viewModeList;

        this.isRendered = (!!this.mainList.length && !!this.mainList[0].length) || (!!this.subList.length && !!this.subList[0].length);

        // Bug: always show confirm dialog when switching park-item Artical page
        if (this.isClone) {
            this.outputData.emit(this.outDataCountries.filter(x => x.isDirty));
        }

        // For Widget Country know 
        if (this.editMode) {
            this.setEditMode(this.editMode);
        }
        else {
            this.noEntryDataEvent.emit(this.viewModeMainList[0].length == 0);
        }
    }

    private checkValueWhenRadioMode(data: any) {
        if (!this._isRadioButtonMode) {
            this.doesCountryHaveOneCheckedValue = true;
            return;
        }

        let mainCheckedList = data.filter(x => x.isActive);
        this.doesCountryHaveOneCheckedValue = (mainCheckedList && (mainCheckedList.length == 1));
    }

    generateDisplayData(data, isAddCbxSelectAll, additionalModel?) {
        let array: Country[] = [];
        let viewModeArray: Country[] = [];
        const _list: Country[][] = [];
        const _viewModeList: Country[][] = [];
        const dataLength = data.length;
        let isAllSelected = true;
        if (isAddCbxSelectAll && data.length > 1)
            array.push(additionalModel);
        (<Country[]>data).forEach((item, index) => {
            item.isActive = (item.isActive && item.isActive.toString() === '1') || item.isActive === true;
            array.push(item);
            if (item.isActive)
                viewModeArray.push(item);
            else
                isAllSelected = false;
            if (array.length === this.defaultRowNo || index === dataLength - 1) {
                _list.push(array);
                array = [];
            }
            if (viewModeArray.length === this.defaultRowNo || index === dataLength - 1) {
                _viewModeList.push(viewModeArray);
                viewModeArray = [];
            }
        });
        if (isAddCbxSelectAll && _list[0] && _list[0][0])
            _list[0][0].isActive = isAllSelected;
        return { list: _list, viewModeList: _viewModeList };
    }

    checkIsCountryModelType(data) {
        this.isCountryModel = !isNil(data.idValue) && !isNil(data.isoCode);
        this.ref.markForCheck();
    }

    private showSubList(isShowed: boolean) {
        this.isShowedSubList = isShowed;
        this.ref.markForCheck();
    }

    public itemChanged(event) {
        switch (event.source.value) {
            case this.idSelectAllMain + '':
                this.UpdateCheckListState(this.mainList, this.idSelectAllMain);
                break;
            case this.idSelectAllSecondary + '':
                this.UpdateCheckListState(this.subList, this.idSelectAllSecondary);
                break;
            default:
                if (event.source._elementRef.nativeElement.getAttribute('data-is-main-item') === 'true')
                    this.selectedAllMainModel.isActive = this.findUncheckedItem(this.mainList) == null;
                else
                    this.selectedAllSecondaryModel.isActive = this.findUncheckedItem(this.subList) == null;
                break;
        }
        this.ref.markForCheck();
        setTimeout(() => {
            this.outputData.emit(this.outDataCountries.filter(x => x.isDirty));
            this.isCompletedRender.emit();
        })
    }

    public radioItemChanged(id) {
        // Update IsActive for all to uncheck
        this.outDataCountries.find(x => x.isActive = false);
        // Re check for this item
        const curSelectedItem = this.outDataCountries.find((item) => item.idValue.toString() === id);
        if (curSelectedItem)
            curSelectedItem.isActive = true;
        this.ref.markForCheck();
        this.outputData.emit(this.outDataCountries.filter(x => x.isDirty));
    }

    private UpdateCheckListState(checkList: Array<Country[]>, id: number) {
        let isCheckedAll = false;
        checkList.forEach((col) => {
            col.forEach((row) => {
                if (id === row.idValue)
                    isCheckedAll = row.isActive;
                else {
                    if (row.isActive != isCheckedAll) {
                        row.isDirty = true;
                    }
                    row.isActive = isCheckedAll;
                }
            })
        });
        this.ref.markForCheck();
    }

    private findUncheckedItem(checkList: Array<Country[]>): Country {
        let result: Country = null;
        checkList.forEach((col) => {
            col.forEach((row) => {
                if (!row.isActive && row.idValue !== this.idSelectAllMain && row.idValue !== this.idSelectAllSecondary) {
                    result = row;
                    return row;
                }
            })
            if (result)
                return result;
        });
        return result;
    }

    private mapDataToCountryModel(data) {
        const result: Country[] = [];
        data.forEach((item, index) => {
            const _item = new Country();

            if (isNumber(item.IdArticleExcludeCountries))
                _item.idArticleExcludeCountries = item.IdArticleExcludeCountries + '';

            _item.isActive = false;
            if (isBoolean(item.IsActive)) {
                _item.isActive = item.IsActive;
            } else {
                _item.isActive = item.IsActive == 1;
            }

            _item.isMain = false
            if (isBoolean(item.IsMain)) {
                _item.isMain = item.IsMain;
            } else {
                _item.isMain = item.IsMain == 1;
            }

            _item.idValue = item.IdIsoCountryCode || item.IdCountrylanguage;
            _item.idValueExtra = Uti.isNullUndefinedEmptyObject(item.IdPersonInterfaceContactCountries) ? null : item.IdPersonInterfaceContactCountries;
            _item.isoCode = item.IsoCode;
            _item.textValue = item.Country || item.CountryLanguage;
            result.push(_item);
        });
        return result;
    }

    public resizeContainer(eve) {
        const flagContainer = $(eve.target).parent().find('div.flag-container')[0];
        const columnElements = $(eve.target).parent().find('div.flag-container div.colum-item');
        let totalWidth = 0;
        if (columnElements.length > 0)
            columnElements.each((index, col) => {
                totalWidth += $(col).width() + 10;
            });
        $(flagContainer).css({ 'min-width': (totalWidth + 10) + 'px' });
    }

    ngOnDestroy() {
    }
}
