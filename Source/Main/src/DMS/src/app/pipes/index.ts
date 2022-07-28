import * as appPipes from '@app/pipes';
export * from './app.pipe';

export const APP_PIPES = [
    appPipes.CellRangePipe,
    appPipes.GlbzPipe,
    appPipes.ToDatePipe,
    appPipes.SafePipe,
    appPipes.ToStringPipe,
    appPipes.DisplaySeparator,
    appPipes.ToNumberPipe,
    appPipes.SanitizeHtmlPipe,
    appPipes.TransFormDecimalPipe
];
