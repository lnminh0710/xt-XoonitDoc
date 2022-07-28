import { Component, OnInit, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy, SimpleChanges, OnChanges, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { DocumentManagementSelectors } from '@app/pages/document-management/document-management.statemanagement/document-management.selectors';
import { GetFileByUrlForWidgetViewerIdAction, DocumentManagementActionNames } from '@app/pages/document-management/document-management.statemanagement/document-management.actions';
import { AppState } from '@app/state-management/store';
import { Store } from '@ngrx/store';
import { BaseViewer } from '../base-viewer';
import { Subscription } from 'rxjs';
import { FileViewerType, KeyCode } from '@app/app.constants';
import { CustomAction } from '@app/state-management/store/actions';
import { cloneDeep } from 'lodash-es';
import { filter } from 'rxjs/operators';


class Coordinate2D {
    scrollX: number;
    scrollY: number;
}

class ResultText {
    rowIndex: number;
    columnIndex: number;
    a: Position
}

class SearchResultText {
    private _iterator: number;
    private _iteratorTextResult: string;

    keyword: string;
    count: number;
    ocurringAtIndex: ResultText[];

    constructor() {
        this._iterator = 0;
    }

    public set iterator(val: number) {
        this._iterator = val;
        if (this._iterator > this.ocurringAtIndex.length) {
            this._iterator = 1;
        } else if (this._iterator < 1) {
            this._iterator = this.ocurringAtIndex.length;
        }

        this._iteratorTextResult = `${this._iterator}/${this.count}`;
    }

    public get iterator() {
        return this._iterator;
    }

    public get iteratorTextResult(): string {
        return this._iteratorTextResult;
    }

    public initIteratorByTotalCount(count: number) {
        if (!count) {
            this._iterator = 0;
        } else {
            this._iterator = 1;
        }
        
        this._iteratorTextResult = `${this._iterator}/${this.count}`;
    }
}

class StructureDataText {
    blocksParagraph: string[];
    largestLengthStringOnRow: number;
    searchResults: SearchResultText;
}


@Component({
    selector: 'text-viewer',
    templateUrl: './text-viewer.component.html',
    styleUrls: ['./text-viewer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class TextViewerComponent extends BaseViewer implements OnInit, AfterViewInit, OnDestroy, OnChanges {

    @ViewChild('searchInput') inputElemRef: ElementRef;
    @ViewChild('fileTextViewer') preElemRef: ElementRef;
    @ViewChild('searchBox') searchBoxElemRef: ElementRef;
    @ViewChild('textViewerContainer') textViewerContainer: ElementRef;

    public structureDataText: StructureDataText;

    private textSubscription: Subscription;
    private originalText: string;
    private MARK_TAG_NAME = 'mark';
    private currentMarkElem: HTMLElement;

    constructor(
        protected router: Router,
        protected documentManagementSelectors: DocumentManagementSelectors,
        protected store: Store<AppState>,
        private cdRef: ChangeDetectorRef,
    ) {
        super(router, store)
        this.subscribeOnAttachViewRef();
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

    ngOnInit() {
        this.cdRef.detach();
    }

    ngAfterViewInit(): void {
        (this.textViewerContainer.nativeElement as HTMLDivElement).addEventListener('keydown', this.onViewerKeyDown.bind(this));
        (this.inputElemRef.nativeElement as HTMLInputElement).addEventListener('keydown', this.onInputKeyDown.bind(this));
    }

    ngOnDestroy(): void {
        this.unsubscribeOnDetachViewRef();
    }

    public updatePath(path: string): void {
        
    }

    public subscribeOnAttachViewRef() {
        this.textSubscription = this.documentManagementSelectors.actionSuccessOfSubtype$(DocumentManagementActionNames.GET_FILE_BY_URL_FOR_WIDGET_VIEWER_ID)
            .pipe(
                filter((action: GetFileByUrlForWidgetViewerIdAction) => action.payload.idWidget === this.uniqueViewerId)
            )
            .subscribe((action: CustomAction) => {
                const blob = action.payload.file as Blob;
                const fileReader = new FileReader();
                fileReader.onload = (data: any) => {
                    const text = this.structureText(data.target.result);
                    this.originalText = text;
                    this.preElemRef.nativeElement.innerHTML = text;
                    this.setDefaultScrollbar();
                    this.clearSearchResult();
                    this.cdRef.detectChanges();
                };
                fileReader.readAsText(blob, 'CP1251');
            });
    }

    public setSupportedFileTypesAsKey() {
        return [
            FileViewerType[FileViewerType.TXT]
        ];
    }

    public isExtensionTheSameGroupType(fileType: FileViewerType) {
        switch(fileType) {
            case FileViewerType.TXT:
                return true;
            default:
                return false;
        }
    }

    public disposeContentOnDetach() {
        this.structureDataText.blocksParagraph = null;
        this.clearSearchResult();

        (this.preElemRef.nativeElement as HTMLPreElement).innerHTML = '';

    }

    public searchText($event) {
        const keyword = $event.target.value;
        this.makeASearch(keyword);
    }

    public scrollToNext() {
        if (!this.canIterate()) return;

        this.structureDataText.searchResults.iterator++;

        const scrollTo = this.calcScrollTo(true);
        (this.preElemRef.nativeElement as HTMLPreElement).scrollTo(scrollTo.scrollX, scrollTo.scrollY);

        this.cdRef.detectChanges();
    }

    public scrollToPrev() {
        if (!this.canIterate()) return;

        this.structureDataText.searchResults.iterator--;

        const scrollTo = this.calcScrollTo(false);
        (this.preElemRef.nativeElement as HTMLPreElement).scrollTo(scrollTo.scrollX, scrollTo.scrollY);

        this.cdRef.detectChanges();
    }

    public cancelSearch($event) {
        this.clearSearchResult();
        this.cdRef.detectChanges();
    }

    public onViewerKeyDown(event: KeyboardEvent) {
        // shift + F combination to find text
        if (event.shiftKey && event.keyCode === 70) {
            (this.searchBoxElemRef.nativeElement as HTMLDivElement).classList.add('show');

            setTimeout(() => {
                // add this line code to TASK QUEUE instead of CALLSTACK. because of in callstack, there is a case generate a key 'F' which is redundant
                // and when we hover-off that occur an event change on input element => make a search on keyword 'F' => BUGS
                this.inputElemRef.nativeElement.focus();
            }, 200)
            
            return;
        }

        // Escape 
        if (event.keyCode === 27) {
            this.clearSearchResult();
            this.cdRef.detectChanges();
            return;
        }
    }

    public onInputKeyDown(event: KeyboardEvent) {
        if (!this.structureDataText.searchResults) return;
        // const inputElem = event.target as HTMLInputElement;
        // if (inputElem.value !== this.structureDataText.searchResults.keyword) {
        //     this.makeASearch(inputElem.value);
        //     return;
        // }

        // Shift + Enter
        if (event.shiftKey && event.keyCode === 13) {
            this.scrollToPrev();
            return;
        }

        // Enter code
        if (event.keyCode === 13) {
            this.scrollToNext();
            return;
        }
    }

    private makeASearch(keyword: string) {
        if (keyword === '') {
            this.preElemRef.nativeElement.innerHTML = this.originalText;
            return;
        }

        setTimeout(() => {
            const result = this.search(keyword);
            this.preElemRef.nativeElement.innerHTML = result;

            if (this.structureDataText.searchResults && this.structureDataText.searchResults.count > 0) {
                const scrollTo = this.calcScrollTo(true);
                (this.preElemRef.nativeElement as HTMLPreElement).scrollTo(scrollTo.scrollX, scrollTo.scrollY);
            }

            this.cdRef.detectChanges();
        }, 200);
    }

    private clearSearchResult() {
        (this.searchBoxElemRef.nativeElement as HTMLDivElement).classList.remove('show');
        (this.preElemRef.nativeElement as HTMLPreElement).innerHTML = this.originalText;
        this.currentMarkElem = null;

        if (!this.structureDataText.searchResults) return;

        (this.inputElemRef.nativeElement as HTMLInputElement).value = '';
        this.structureDataText.searchResults.ocurringAtIndex = null;
        this.structureDataText.searchResults = null;
    }

    private setDefaultScrollbar() {
        (this.preElemRef.nativeElement as HTMLPreElement).scrollLeft = 0;
        (this.preElemRef.nativeElement as HTMLPreElement).scrollTop = 0;
    }

    private structureText(text: string) {
        const arrayParagraph = text.split(/[\n\r]/g);
        this.structureDataText = new StructureDataText();
        this.structureDataText.blocksParagraph = [];
        this.structureDataText.largestLengthStringOnRow = 0;

        for (let index = 0; index < arrayParagraph.length; index++) {
            const paragraph = arrayParagraph[index];
            if (paragraph === '') continue;

            if (paragraph.length > this.structureDataText.largestLengthStringOnRow) {
                this.structureDataText.largestLengthStringOnRow = paragraph.length;
            }

            this.structureDataText.blocksParagraph.push(paragraph);
        }

        return this.structureDataText.blocksParagraph.join('\n');
    }

    private search(keyword: string) {
        const data = cloneDeep(this.structureDataText.blocksParagraph) as string[];
        const searchResults = this.structureDataText.searchResults = new SearchResultText();
        const regExp = new RegExp(keyword, 'gi');

        const openClosedMarkTag = `<${this.MARK_TAG_NAME} class="${this.MARK_TAG_NAME}_"></${this.MARK_TAG_NAME}>`;

        searchResults.keyword = keyword;
        searchResults.ocurringAtIndex = [];
        searchResults.count = 0;

        for (let index = 0; index < data.length; index++) {
            const regexIterator = data[index]["matchAll"](regExp);

            let iterator = regexIterator.next();
            if (iterator.done) continue;

            let replacedNewString: string;
            let lengthAppend = searchResults.count.toString().length;
            while(!iterator.done) {
                replacedNewString = `<${this.MARK_TAG_NAME} class="${this.MARK_TAG_NAME}_${searchResults.count}">${iterator.value[0]}</${this.MARK_TAG_NAME}>`;
                searchResults.count += 1;

                data[index] = data[index].substring(0, iterator.value.index + lengthAppend) + 
                                                replacedNewString + 
                                                data[index].substring(iterator.value.index + lengthAppend + keyword.length, data[index].length);

                searchResults.ocurringAtIndex.push(<ResultText>{
                    rowIndex: index,
                    columnIndex: iterator.value.index
                });

                iterator = regexIterator.next();
                lengthAppend += openClosedMarkTag.length + searchResults.count.toString().length;
            }
        }
        searchResults.initIteratorByTotalCount(searchResults.count);
        return data.join('\n');
    }

    private calcScrollTo(next: boolean): Coordinate2D {
        const preElem = (this.preElemRef.nativeElement as HTMLPreElement);
        const searchResults = this.structureDataText.searchResults;
        const heightPerRow = preElem.scrollHeight / this.structureDataText.blocksParagraph.length;
        const widthPerCol = preElem.scrollWidth / this.structureDataText.largestLengthStringOnRow;

        const iterator = searchResults.iterator - 1;
        const resultText = searchResults.ocurringAtIndex[iterator];
        const wishScrollTop = heightPerRow * resultText.rowIndex;
        const wishScrollLeft = widthPerCol * resultText.columnIndex;

        const distanceHeight = Math.abs(wishScrollTop - preElem.scrollTop);
        const distanceWidth = Math.abs(wishScrollLeft - preElem.scrollLeft);

        const coordinate2D = new Coordinate2D();
        coordinate2D.scrollX = wishScrollLeft - 50;
        coordinate2D.scrollY = wishScrollTop;

        if (this.currentMarkElem) {
            this.currentMarkElem.style.backgroundColor = null;
        }
        this.currentMarkElem = (this.preElemRef.nativeElement as HTMLPreElement).getElementsByClassName(`${this.MARK_TAG_NAME}_${iterator}`)[0] as HTMLElement;
        this.currentMarkElem.style.backgroundColor = 'orange';

        if (next) {
            
            if (distanceHeight < preElem.clientHeight) {
                coordinate2D.scrollY = preElem.scrollTop + distanceHeight;
            }

            return coordinate2D;            
        }

        return coordinate2D;
    }

    private canIterate(): boolean {
        return  this.structureDataText.searchResults &&
                this.structureDataText.searchResults.ocurringAtIndex &&
                this.structureDataText.searchResults.ocurringAtIndex.length !== 0;
    }
}
