import { Injectable } from '@angular/core';
import { IMyOptions } from '../interfaces/my-options.interface';
import { IMyDayLabels } from '../interfaces/my-day-labels.interface';
import { IMyMonthLabels } from '../interfaces/my-month-labels.interface';
import { IMyDate } from '../interfaces/my-date.interface';
import { IMyMarkedDates } from '../interfaces/my-marked-dates.interface';
import { IMyDateRange } from '../interfaces/my-date-range.interface';
import { IMyMarkedDate } from '../interfaces/my-marked-date.interface';
import { Year } from '../enums/year.enum';

/**
 * Configuration service for the NgxMyDatePicker component.
 * You can inject this service, typically in your root component, and customize the values of its properties in
 * order to provide default values for all the datepickers used in the application.
 */
@Injectable()
export class NgxMyDatePickerConfig implements IMyOptions {
    dayLabels: IMyDayLabels = {su: 'Sun', mo: 'Mon', tu: 'Tue', we: 'Wed', th: 'Thu', fr: 'Fri', sa: 'Sat'};
    monthLabels: IMyMonthLabels = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec'};
    dateFormat = 'MM/dd/yyyy';
    showTodayBtn = true;
    todayBtnTxt = 'Today';
    firstDayOfWeek = 'mo';
    satHighlight = false;
    sunHighlight = true;
    highlightDates = <Array<IMyDate>> [];
    markCurrentDay = true;
    markCurrentMonth = true;
    markCurrentYear = true;
    monthSelector = true;
    yearSelector = true;
    disableHeaderButtons = true;
    showWeekNumbers = false;
    selectorHeight = '232px';
    selectorWidth = '252px';
    disableUntil = <IMyDate> {year: 0, month: 0, day: 0};
    disableSince = <IMyDate> {year: 0, month: 0, day: 0};
    disableDates = <Array<IMyDate>> [];
    enableDates = <Array<IMyDate>> [];
    markDates = <Array<IMyMarkedDates>> [];
    markWeekends = <IMyMarkedDate> {};
    disableDateRanges = <Array<IMyDateRange>> [];
    disableWeekends = false;
    disableWeekdays = <Array<string>> [];
    alignSelectorRight = false;
    openSelectorTopOfInput = false;
    closeSelectorOnDateSelect = true;
    closeSelectorOnDocumentClick = true;
    minYear = <number> Year.min;
    maxYear = <number> Year.max;
    showSelectorArrow = false;
    allowSelectionOnlyInCurrentMonth = true;
    appendSelectorToBody = true;
    focusInputOnDateSelect = true;
    ariaLabelPrevMonth = 'Previous Month';
    ariaLabelNextMonth = 'Next Month';
    ariaLabelPrevYear = 'Previous Year';
    ariaLabelNextYear = 'Next Year';
    minWidth = '225px';
    minHeight = '225px';
    dontAutoFillDateWhenEnter = false;
}
