export class ZipMaskPattern {
    public validationZipMaskFormat: string = '';
    public validationZipRegEx: string = '';
    public validationZip2MaskFormat: string = '';
    public validationZip2RegEx: string = '';

    public constructor(init?: Partial<ZipMaskPattern>) {
        Object.assign(this, init);
    }
}
