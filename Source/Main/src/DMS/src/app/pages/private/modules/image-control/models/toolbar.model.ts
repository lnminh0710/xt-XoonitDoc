export class ToolbarConfigModel {
    public isShowShare?: boolean;
    public isShowDownload?: boolean;
    public isShowSendMail?: boolean;
    public isShowPrinter?: boolean;
    public isShowKeyword?: boolean;
    public isShowTodo?: boolean;
    public isShowOCRManually?: boolean;
    public isShowClean?: boolean;
    public isShowApplyAIData?: boolean;
    public isShowApplyQRData?: boolean;

    public isShowMoveMode?: boolean;
    public isShowEditMode?: boolean;

    public isHideGroupIcon?: boolean;
    public isHideViewActualIcon?: boolean;

    public constructor(init?: Partial<ToolbarConfigModel>) {
        Object.assign(this, init);
    }
}
