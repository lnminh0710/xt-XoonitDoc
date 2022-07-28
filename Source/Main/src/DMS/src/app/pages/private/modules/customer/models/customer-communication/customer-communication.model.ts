export class CustomerCommunication {
    public id: string;
    public isMain: boolean = false;
    public businessTitle: string;
    public name: string;

    public mailValue: CustomerCommunicationValue = new CustomerCommunicationValue();
    public values: Array<CustomerCommunicationValue> = [];

    public constructor(init?: Partial<CustomerCommunication>) {
        Object.assign(this, init);
    }
}
export class CustomerCommunicationValue {
    public isMain: boolean = false;
    public value1: string;
    public value2: string;

    public constructor(init?: Partial<CustomerCommunicationValue>) {
        Object.assign(this, init);
    }
}
