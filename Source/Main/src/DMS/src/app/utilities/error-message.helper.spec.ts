
import { FormControl, FormGroup } from '@angular/forms';
import { PasswordDisplay } from '@app/app.constants';
import { XnErrorMessageHelper } from './error-message.helper';


describe('XnErrorMessageHelper', () => {
    let component: XnErrorMessageHelper;

    beforeEach((() => {
        component = new XnErrorMessageHelper();
    }));

    afterEach(() => {
        component = null;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // isRequired
    it('isRequired is success', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        form.controls[controlName].markAsTouched();
        form.controls[controlName].setErrors({ 'required': true });
        expect(component.isRequired(form, controlName)).toBeTruthy();
    });

    it('isRequired is true with undefined control name', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = undefined;
        expect(component.isRequired(form, controlName)).toBeTruthy();
    });

    it('isRequired is failed with dont touch control', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        form.controls[controlName].setErrors({ 'required': true });
        expect(component.isRequired(form, controlName)).toBeFalsy();
    });


    // isInvalidPattern
    it('isInvalidPattern is true', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        form.controls[controlName].markAsTouched();
        form.controls[controlName].setErrors({ 'pattern': true });
        form.controls[controlName].hasError('pattern');
        expect(component.isInvalidPattern(form, controlName)).toBeTruthy();

    });

    it('isInvalidPattern is false', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        expect(component.isInvalidPattern(form, controlName)).toBeFalsy();

    });

    it('isInvalidPattern is true with undefined control name', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = undefined;
        expect(component.isInvalidPattern(form, controlName)).toBeTruthy();

    });

    it('isInvalidPattern is failed with dont touch control', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        form.controls[controlName].setErrors({ 'pattern': true });
        expect(component.isInvalidPattern(form, controlName)).toBeFalsy();
    });

    // isMatchPass
    it('isMatchPass is true', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        const isMatch = false;
        form.controls[controlName].markAsTouched();
        expect(component.isMatchPass(form, controlName, isMatch)).toBeTruthy();

    });

    it('isMatchPass is false with dont touch', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        const isMatch = false;
        expect(component.isMatchPass(form, controlName, isMatch)).toBeFalsy();

    });

    it('isMatchPass is false with isMatch true', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = 'first';
        form.controls[controlName].markAsTouched();
        const isMatch = true;
        expect(component.isMatchPass(form, controlName, isMatch)).toBeFalsy();

    });

    it('isMatchPass is true with undefined control name', () => {
        const form = new FormGroup({
            first: new FormControl(),
            last: new FormControl()
        });
        form.setValue({ first: 'Nancy', last: 'Drew' });
        const controlName = undefined;
        const isMatch = false;
        expect(component.isMatchPass(form, controlName, isMatch)).toBeTruthy();

    });

    // changePasswordType
    it('changePasswordType with type is password', () => {
        const currentType = 'password';
        expect(component.changePasswordType(currentType)).toEqual(PasswordDisplay.TEXT);
    });

    it('changePasswordType with type is another', () => {
        const currentType = 'test';
        expect(component.changePasswordType(currentType)).toEqual(PasswordDisplay.PASSWORD);
    });
});
