export enum AttachmentType {
    IMAGE = 'IMAGE',
    PDF = 'PDF',
    OFFICE = 'OFFICE',
    TXT_JSON = 'TXT_JSON',
    MEDIA = 'MEDIA',
    HTML = 'HTML',
    NOT_SUPPORT = 'NOT_SUPPORT',
}

export abstract class AttachmentViewer {
    private static readonly imageExtensions = 'png|jpg|jpeg|svg|ico';
    private static readonly pdfExtensions = 'pdf';
    private static readonly officeExtensions = 'doc|docx|xls|xlsx|xlsm|ppt|pptx';
    private static readonly txtJsonExtensions = 'txt|json|xml|csv|text|js|jsx|ts|tsx|xaml|xsl|xslt|xsml|url';
    private static readonly mediaExtensions = 'mp3|mp4';
    private static readonly htmlExtensions = 'htm|html';

    public static getAttachmentType(extension: string): AttachmentType {
        switch (true) {
            case AttachmentViewer.imageExtensions.includes(extension):
                return AttachmentType.IMAGE;
            case AttachmentViewer.pdfExtensions.includes(extension):
                return AttachmentType.PDF;
            case AttachmentViewer.officeExtensions.includes(extension):
                return AttachmentType.OFFICE;
            case AttachmentViewer.txtJsonExtensions.includes(extension):
                return AttachmentType.TXT_JSON;
            case AttachmentViewer.mediaExtensions.includes(extension):
                return AttachmentType.MEDIA;
            case AttachmentViewer.htmlExtensions.includes(extension):
                return AttachmentType.HTML;
            default:
                return AttachmentType.NOT_SUPPORT;
        }
    }
}
