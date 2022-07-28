import { Observable } from 'rxjs';
import { parse } from 'date-fns/esm';
import { debounceTime } from 'rxjs/operators';

export class ValidationService {
    static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
        const config = {
            'required': 'Required',
            'exists': 'The value already in use',
            'invalidCreditCard': 'Is invalid credit card number',
            'email': 'Invalid email address',
            'invalidPassword': 'Password is not correct the password rule',
            'invalidDate': 'Invalid date',
            'minlength': 'Minimum length ${validatorValue.requiredLength}',
            'invalidValidThru': 'Valid thru value is invalid ',
            'invalidBirthDate': 'The date must be less than today',
            'pattern': 'Invalid pattern'
        };
        return config[validatorName];
    }

    static creditCardValidator(control) {
        return new Observable<any>((obser) => {
            let controlValue = control.value.replace(/\D/g, '');
            let valid = (controlValue.length == 16); // accept only digits, dashes or spaces

            if (valid) {
                let nCheck = 0, nDigit = 0, bEven = false;
                controlValue = controlValue.replace(/\D/g, '');

                for (let n = controlValue.length - 1; n >= 0; n--) {
                    let cDigit = controlValue.charAt(n),
                        nDigit = parseInt(cDigit, 10);
                    if (bEven) {
                        if ((nDigit *= 2) > 9) nDigit -= 9;
                    }
                    nCheck += nDigit;
                    bEven = !bEven;
                }
                valid = (nCheck % 10) == 0;
            }

            if (valid) {
                obser.next(null);
            } else {
                const validator = { 'invalidCreditCard': false };
                obser.next(validator);
            }
            obser.complete();
        }).pipe(
            debounceTime(400),
        );
    }

    static validThruValidator(control) {
        return new Observable<any>((obser) => {
            const validThruRaw = control.value;
            const realValidThru = validThruRaw.replace(/_/g, '');
            const length = realValidThru.length;
            let valid = length == 5;
            if (valid) {
                const validThruArray = realValidThru.split('/');
                const validThruMonth = parseInt(validThruArray[0]);
                const validThruYear = parse(validThruArray[1], 'yy', new Date()).getFullYear();
                const currentYear = (new Date()).getFullYear();
                if (validThruYear < currentYear) valid = false;
                if (valid && validThruYear == currentYear) {
                    const currentMonth = (new Date()).getMonth() + 1;
                    if (validThruMonth < currentMonth) valid = false;
                }
                if (valid && (validThruMonth == 0 || validThruMonth > 12)) valid = false;
            }
            if (valid) {
                obser.next(null);
            } else {
                const validator = { 'invalidValidThru': valid };
                obser.next(validator);
            }
            obser.complete();
        }).pipe(
            debounceTime(400),
        );
    }

    static emailValidator(control) {
        /*
        abcd@xyz.com
        */
        return new Observable<any>((obser) => {
            if (control.value) {
                if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
                    obser.next(null);
                } else {
                    const validator = { 'email': true };
                    obser.next(validator);
                }
            }
            obser.complete();
        }).pipe(
            debounceTime(400),
        );
    }

    static birthDateValidator(control) {
        /*
        abcd@xyz.com
        */
        return new Observable<any>((obser) => {
            try {
                if (control.value) {
                    let controlValue = control.value;
                    if (typeof controlValue === 'string') {
                        controlValue = new Date(controlValue);
                    }
                    var now = new Date();
                    if (controlValue < now) {
                        obser.next(null);
                    } else {
                        const validator = { 'invalidBirthDate': true };
                        obser.next(validator);
                    }
                }
                obser.complete();
            }
            catch (e) {
                obser.next(null);
                obser.complete();
            }
        }).pipe(
            debounceTime(400),
        );
    }

    static passwordValidator(control) {
        /*
        Minimum 8 characters
        At least 1 Uppercase Alphabet
        At least 1 Lowercase Alphabet
        At least 1 Number
        At least one special char among these: ~`!@#$%^&*()_-+={[}]|\:':"<,>.?/
        */
        return new Observable<any>((obser) => {
            if (control.value) {
                if (control.value.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\:\;\"\'\<\,\>\.\?\/])[A-Za-z\d\~\`\!\@\#\$\%\^\&\*\(\)\-\_\+\=\[\]\{\}\|\\\:\;\"\'\<\,\>\.\?\/]{8,}/)) {
                    obser.next(null);
                } else {
                    const validator = { 'invalidPassword': true };
                    obser.next(validator);
                }
            }
            obser.complete();
        }).pipe(
            debounceTime(400),
        );
    }

    static dateValidator(control) {
        if (control.valid) {
            return null;
        } else {
            return { 'invalidDate': true };
        }
    }
}
