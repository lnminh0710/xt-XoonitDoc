export class GalleryImage {
    public source: string = '';
    public title: string = '';
    public description: string = '';
    public isMain: boolean = false;
    public isSelected: boolean = false;
    public isDeleted: boolean = false;
    [key: string]: any;
    
    public constructor(init?: Partial<GalleryImage>) {
        Object.assign(this, init);
    }
}