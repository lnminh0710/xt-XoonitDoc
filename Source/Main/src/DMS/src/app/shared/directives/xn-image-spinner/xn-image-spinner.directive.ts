import { Directive, ElementRef, Input, OnInit, Renderer2, Output, EventEmitter, OnDestroy } from '@angular/core';

@Directive({
    selector: '[imageSpinner]',
})
export class XnImageSpinnerDirective implements OnInit, OnDestroy {
    @Input() imageSpinner;
    @Input() imageNameDefault = 'noimage.jpg';

    @Output() loaded: EventEmitter<any> = new EventEmitter();
    private loadingDiv: any;
    private loadingSrc = '/public/assets/img/loading-spinner.gif';
    private _image: HTMLImageElement;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        this.loadingDiv = document.createElement('img');
        this.loadingDiv.src = this.loadingSrc;
        this.loadingDiv.style.position = 'absolute';
        this.loadingDiv.style.height = '50px';
        this.loadingDiv.style.width = '50px';
        this.loadingDiv.style.top = '50%';
        this.loadingDiv.style.left = 'calc(50% - 25px)';

        if (el.nativeElement.parentNode) {
            el.nativeElement.parentNode.appendChild(this.loadingDiv);
        }
        el.nativeElement.style.display = 'none';
    }

    ngOnInit() {
        this.loadImg();
    }

    ngOnDestroy() {
        this._image.src = '';
    }

    private loadImg() {
        const image = new Image();
        image.addEventListener('load', (img: any) => {
            this.el.nativeElement.style.display = 'block';
            this.el.nativeElement.src = this.imageSpinner;
            //   this
            if (image.width > image.height) {
                this.el.nativeElement.style.width = '100%';
            } else {
                this.el.nativeElement.style.height = '100%';
            }
            $(this.el.nativeElement).parent().addClass('done');
            // this.el.nativeElement.parent.class += ' done';
            if (this.loadingDiv) {
                this.renderer.setStyle(this.loadingDiv, 'display', 'none');
            }
            this.loaded.emit();
        });
        image.addEventListener('error', () => {
            this.el.nativeElement.style.display = 'block';
            this.el.nativeElement.src = '/public/assets/img/' + this.imageNameDefault;
            if (this.loadingDiv) {
                this.renderer.setStyle(this.loadingDiv, 'display', 'none');
            }
            $(this.el.nativeElement).parent().addClass('done');

            this.loaded.emit();
        });
        image.src = this.imageSpinner;
        this._image = image;
    }

    public reloadImg(imgUrl) {
        this.imageSpinner = imgUrl;
        this.loadImg();
    }
}
