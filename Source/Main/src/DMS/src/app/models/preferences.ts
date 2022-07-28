export class Preferencies {
    public preferredLang: string = null;

    public constructor(init?: Partial<Preferencies>) {
        Object.assign(this, init);
    }
}
