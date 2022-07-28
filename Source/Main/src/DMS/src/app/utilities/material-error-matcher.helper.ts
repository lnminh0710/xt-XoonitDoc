import { ErrorStateMatcher } from "@app/shared/components/xn-control/light-material-ui/core";
import { FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { Injectable } from "@angular/core";

@Injectable()
export class MaterialErrorStateMatcherHelper implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!(control && control.invalid && control.parent.dirty);
        const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

        return (invalidCtrl || invalidParent);
    }
}