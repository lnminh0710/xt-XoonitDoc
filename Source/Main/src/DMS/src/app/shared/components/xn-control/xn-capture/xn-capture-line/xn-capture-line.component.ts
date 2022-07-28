import {
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    ChangeDetectorRef,
} from '@angular/core';
import {
    BaseComponent
} from '@app/pages/private/base';
import {
    Router
} from '@angular/router';
@Component({
    selector: 'xn-capture-line',
    styleUrls: ['./xn-capture-line.component.scss'],
    templateUrl: './xn-capture-line.component.html'
})
export class CaptureLine extends BaseComponent implements OnInit, OnDestroy {
    public escStyle: any;
    public top: any;
    public left: any;
    public rectangle: any = {};
    private style: any = {};
    private original: any = {};
    @Input() isShowCapture: boolean;
    @Output() addImage = new EventEmitter < any > ();
    @Output() hideCapture = new EventEmitter < any > ();
    constructor(
        private cdRef: ChangeDetectorRef,
        protected router: Router
    ) {
        super(router);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }
    public ngOnInit() {
        const node = document.getElementById("feedback-canvas");
        node.addEventListener("mousedown", this.onMouseDown);
        node.addEventListener("mouseup", this.onMouseUp);
        document.addEventListener("keyup", this.handleKeyUp);
        document.addEventListener("mousemove", this.onMouseMove);
    }
    public ngOnDestroy() {
        const node = document.getElementById("feedback-canvas");
        node.removeEventListener("mousedown", this.onMouseDown);
        node.removeEventListener("mouseup", this.onMouseUp);
        document.removeEventListener("keyup", this.handleKeyUp);
        document.removeEventListener("mousemove", this.onMouseMove);
    }
    public handleKeyUp = e => {
        e.stopPropagation();
        if (e.keyCode === 27) {
            this.hideCapture.emit();
            this.original = null;
            this.rectangle = null;
        }
    }
    private getMouse(e) {
        const left = e.pageX;
        const top = e.pageY;
        return {
            left,
            top
        };
    }
    public updateCoordinateLines({
        top,
        left,
        original
    }) {
        const y = top > original.top ? original.top : top;
        const x = left > original.left ? original.left : left;
        const rectangle = {
            top: y,
            left: x,
            width: Math.abs(left - original.left),
            height: Math.abs(top - original.top)
        };
        return rectangle;
    }
    public onMouseUp(e) {
        if (!this.isShowCapture) {
            return;
        }
        if (this.rectangle) {
            const {
                width,
                height,
                top,
                left
            } = this.rectangle;
            this.addImage.emit({
                top,
                left,
                width: width < 48 ? 48 : width,
                height: height < 48 ? 48 : height
            });
        }
        this.original = null;
        this.rectangle = null;
    }
    public onMouseDown(e) {
        if (!this.isShowCapture) {
            return;
        }
        const {
            top,
            left
        } = this.getMouse(e);
        const original = {
            top,
            left
        };
        this.top = top;
        this.left = left;
        this.original = original;
        this.rectangle = this.updateCoordinateLines({
            top,
            left,
            original
        });
    }
    public onMouseMove(e) {
        const {
            top,
            left
        } = this.getMouse(e);
        this.top = top;
        this.left = left;
        if (!this.isShowCapture) {
            return;
        }
        const original = this.original;
        // Drawing
        if (this.rectangle) {
            const rectangle = this.updateCoordinateLines({
                top,
                left,
                original
            });
            this.original = original;
            this.rectangle = rectangle;
        }
        this.cdRef.detectChanges();
    }
}