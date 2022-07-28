import { Pipe } from "@angular/core";

@Pipe({
    name: 'itemHasCount'
})
export class ItemHasCountPipe {
    transform(arr: {count: number; [key: string]: any}[]): number {
        return arr?.filter?.(item => item.count > 0).length;
    }
}
