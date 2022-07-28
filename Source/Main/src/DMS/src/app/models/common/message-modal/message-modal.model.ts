export class MessageModalModel {
    messageType: any = null;
    modalSize: any = null;
    customClass: any = null;
    header: MessageModalHeaderModel = null;
    body: MessageModalBodyModel = null;
    footer: MessageModalFooterModel = null;

    /* This group use for short Message Information */
    headerText: string = null;
    bodyText: string = null;
    buttonText: string = null;
    callBackFunc: any = null;
    showCloseButton: any = null;

    constructor(init?: Partial<MessageModalModel>) {
        Object.assign(this, init);
    }
}

export class MessageModel {
    messageType: string = '';
    modalSize: string = '';
    headerText: string = '';
    headerIconClass: string = '';
    message: Array<any> = [];
    okText: string = '';
    cancelText: string = '';
    callBackCloseButton: any = null;
    callBack: any = null;
    callBack1: any = null;
    callBack2: any = null;
    buttonType1: string = '';
    buttonType2: string = '';
    buttonType3: string = '';
    customClass: string = '';
    showCloseButton: any = false;
    isOnTop: boolean = false;

    constructor(init?: Partial<MessageModel>) {
        Object.assign(this, init);
    }
}

export class MessageModalHeaderModel {
    text: string = null;
    styleClass: string = null;
    iconClass: string = null;

    constructor(init?: Partial<MessageModalHeaderModel>) {
        Object.assign(this, init);
    }
}

export class MessageModalBodyModel {
    public content: any = null;
    public isHtmlContent: boolean = false;

    public constructor(init?: Partial<MessageModalBodyModel>) {
        Object.assign(this, init);
    }
}

export class MessageModalFooterModel {
    public buttonList: ButtonList[] = null;

    public constructor(init?: Partial<MessageModalFooterModel>) {
        Object.assign(this, init);
    }
}

export class ButtonList {
    public buttonType: any = null;
    public text: string = null;
    public customClass: string = null;
    public callBackFunc: any = null;
    public disabled = false;

    public constructor(init?: Partial<ButtonList>) {
        Object.assign(this, init);
    }
}
