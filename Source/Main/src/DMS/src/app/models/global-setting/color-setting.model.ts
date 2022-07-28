export class ColorSettingModel {
    public name: string = '';
    public class1: string = '';
    public class2: string = '';
    public class3: string = '';
    public class4: string = '';
    public class5: string = '';
    public class6: string = '';
    public class7: string = '';
    public active: boolean = false;

    public constructor(init?: Partial<ColorSettingModel>) {
        Object.assign(this, init);
    }
}
