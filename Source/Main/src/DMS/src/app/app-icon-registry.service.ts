import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@xn-control/light-material-ui/icon';
import { DomSanitizer } from '@angular/platform-browser';

export class IconNames {
    public static WIDGET_IMPORT_UPLOAD_FILE_Visibility = 'wipf_visibility';
    public static WIDGET_IMPORT_UPLOAD_FILE_Refresh = 'wipf_refresh';
    public static WIDGET_IMPORT_UPLOAD_FILE_Cancel = 'wipf_cancel';
    public static WIDGET_IMPORT_UPLOAD_FILE_Remove = 'wipf_remove';
    public static WIDGET_IMPORT_UPLOAD_ATTACHMENT = 'wipf_attachment';

    public static WIDGET_DMS_ACTIONS_Save = 'wdas_save';
    public static WIDGET_DMS_ACTIONS_Delete = 'wdas_delete';
    public static WIDGET_DMS_ACTIONS_Toggle_Captured_Form = 'wdas_toggle_captured_form';

    public static WIDGET_MYDM_FORM_Scan_QR = 'wmdf_scan_qr';
    public static WIDGET_MYDM_FORM_Scan_OCR = 'wmdf_scan_ocr';
    public static WIDGET_MYDM_FORM_Reset = 'wmdf_reset';
    public static WIDGET_MYDM_FORM_Clear = 'wmdf_clear';
    public static WIDGET_MYDM_FORM_Edit = 'wmdf_edit';
    public static WIDGET_MYDM_FORM_Toggle_Private_Person = 'wmdf_toggle_private_person';
    public static WIDGET_MYDM_FORM_Add_Dynamic_Field = 'wmdf_add_dynamic_field';
    public static WIDGET_MYDM_FORM_Undo = 'wmdf_undo';

    public static XN_DOCUMENT_TREE_Toggle_Collapse_Tree = 'xdt_collapse_tree';
    public static XN_DOCUMENT_TREE_Hamburger = 'icon-space-hamburger';

    public static APP_CHEVRON_DOWN_CIRCLE = 'chevron-down-circle';
    public static APP_FAILED_CIRCLE = 'failed-circle';
    public static APP_CHECKED_CIRCLE = 'checked-circle';
    public static APP_FOLDER_WHITE_BLUE = 'folder_white_blue';
    public static APP_WRITE_FILE = 'write-file';
    public static APP_WRITE = 'write';
    public static APP_ADD_FILE = 'add-file';
    public static APP_EXPORT_FILE = 'export-file';
    public static APP_USER_MAN_ADD = 'user-man-add';
    public static APP_WARNING_TRIANGLE = 'warning-triangle';
    public static APP_CLOSE_POPUP = 'icon-close-popup';
    public static FILE_PROCESS_FAIL_CIRCLE = 'file-process-fail-circle';
    public static FILE_PROCESSING_CIRCLE = 'file-processing-circle';
    public static DOCUMENT_PROCESSING_CIRCLE = 'file-processing-circle';
    public static APP_DOWNLOAD = 'download';
    public static APP_PRINT = 'print';
    public static PREV_ARROW = 'prev-arrow';
    public static SHARE = 'share';
    public static GRIP = 'grip';
    public static TREE_FOLDER = 'tree-folder';
    public static TREE_USER = 'tree-user';
    public static TREE_COMPANY = 'tree-company';
    public static WALLET = 'wallet';
    public static EMAIL_LETTER = 'email-letter';
    public static MEDALS = 'medals';
    public static BILL = 'bill';
    public static FILE = 'file';
    public static NOTE = 'note';
    public static APP_BIN_TRASH = 'bin-trash';
    public static ATM = 'atm';
    public static FILE_ADD = 'file-add';
    public static FULL_SCREEN = 'fullscreen';
    public static MINIMIZE = 'minimize';
    public static FULL_SCREEN_MINIMIZE = 'fullscreen_minimize';
    public static MEMBER_PERMISSION = 'member_permission';
}

@Injectable({ providedIn: 'root' })
export class AppIconRegistryService {
    private _rootUrl = 'public/imgs';

    constructor(private iconRegistry: MatIconRegistry, private sanitizer: DomSanitizer) {}

    public registerIcons() {
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_IMPORT_UPLOAD_FILE_Visibility,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-visibility.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_IMPORT_UPLOAD_FILE_Refresh,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-refresh.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_IMPORT_UPLOAD_FILE_Cancel,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-clear.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_IMPORT_UPLOAD_FILE_Remove,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon_import_trash.png`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_IMPORT_UPLOAD_ATTACHMENT,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/iconspace_Attachment.svg`),
        );

        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_DMS_ACTIONS_Toggle_Captured_Form,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-btn-toggle-captured-form.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_DMS_ACTIONS_Save,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-btn-captured-save.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_DMS_ACTIONS_Delete,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-btn-captured-delete.svg`),
        );

        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Scan_QR,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-qr.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Scan_OCR,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-ai.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Reset,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/iconspace_Rotate Copy 2.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Clear,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/broom.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Toggle_Private_Person,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-contact-person.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Add_Dynamic_Field,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/plus-2.svg`),
        );

        this.iconRegistry.addSvgIcon(
            IconNames.XN_DOCUMENT_TREE_Toggle_Collapse_Tree,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-collapse-tree.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.XN_DOCUMENT_TREE_Hamburger,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/iconspace-hamburger.svg`),
        );

        this.iconRegistry.addSvgIcon(
            IconNames.APP_CHEVRON_DOWN_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/chevron-down-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_FAILED_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-failed-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_CHECKED_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-check-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_FOLDER_WHITE_BLUE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/iconspace_Folder.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_WRITE_FILE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/write.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_WRITE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/write.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_ADD_FILE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-add-file.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_EXPORT_FILE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-export-file.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_USER_MAN_ADD,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-user-man-add.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.TREE_FOLDER,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/tree-folder.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.TREE_USER,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/tree-user.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.TREE_COMPANY,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/tree-company.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_WARNING_TRIANGLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/warning.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_CLOSE_POPUP,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/close-dialog.svg`),
        );

        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Edit,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/draw.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FILE_PROCESS_FAIL_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-file-process-failed-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FILE_PROCESSING_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-file-processing-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.DOCUMENT_PROCESSING_CIRCLE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icon-document-processing-circle.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WIDGET_MYDM_FORM_Undo,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/undo.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_DOWNLOAD,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/download.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_PRINT,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/printer.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.PREV_ARROW,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/prev-arrow-disabled.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.SHARE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/share.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.GRIP,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/grip.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.WALLET,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/wallet.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.EMAIL_LETTER,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/email-letter.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.MEDALS,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/medals.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.BILL,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/bill.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FILE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/file.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.NOTE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/note.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.APP_BIN_TRASH,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/bin-trash.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.ATM,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/atm.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FILE_ADD,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/file-add.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FULL_SCREEN,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/fullscreen.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.MINIMIZE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/minimize.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.FULL_SCREEN_MINIMIZE,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/fullscreen_minimize.svg`),
        );
        this.iconRegistry.addSvgIcon(
            IconNames.MEMBER_PERMISSION,
            this.sanitizer.bypassSecurityTrustResourceUrl(`${this._rootUrl}/icons/user-permission.svg`),
        );
    }
}
