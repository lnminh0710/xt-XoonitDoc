import {
    ScheduleEvent
} from '@app/models';

export class TimeSchedule {
    public name: string = '';
    public select: boolean = false;

    public constructor(init?: Partial<TimeSchedule>) {
        Object.assign(this, init);
    }
}

export class ScheduleEventConfig {
    public name: string = '';
    public isChange: boolean = false;
    public isPrimary: boolean = false;
    public data: Array<ScheduleEvent> = [];

    public constructor(init?: Partial<ScheduleEventConfig>) {
        Object.assign(this, init);
    }
}

export class ScheduleSettingData {
    public startDate: Date = null;
    public stopDate: Date = null;
    public scheduleType: string = '';
    public scheduleEvents: Array<ScheduleEvent> = null;

    public constructor(init?: Partial<ScheduleSettingData>) {
        Object.assign(this, init);
    }
}
