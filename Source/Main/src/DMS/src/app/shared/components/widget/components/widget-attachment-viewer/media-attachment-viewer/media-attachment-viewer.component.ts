import { Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { Uti } from '@app/utilities';
import videojs from 'video.js'

@Component({
  selector: 'media-attachment-viewer',
  templateUrl: './media-attachment-viewer.component.html',
  styleUrls: ['./media-attachment-viewer.component.scss']
})
export class MediaAttachmentViewerComponent implements OnDestroy {

  @ViewChild('target', { static: true }) target: ElementRef;
  @Input() set src(sc: string) {
    this.buildOptions(sc);
    if (sc) {
      this.init();
    }
  }
  options: any;
  cssClass: string;
  player: videojs.Player;

  constructor(
    private elementRef: ElementRef
  ) { }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }

  public onPauseMedia($event) {
  }

  public onPlayerReady(event) {
  }

  private buildOptions(src: string) {
    if (Uti.getFileExtension(src).includes('mp3')) {
      this.cssClass = "audio-viewer";
      this.options = {
        autoplay: false,
        bigPlayButton: false,
        muted: false,
        controls: true,
        autoSetup: true,
        preload: 'none',
        controlBar: { muteToggle: false, fullscreenToggle: true, pictureInPictureToggle: false },
        src: src,
        height: 63,
        width: 250,
        removeClass: 'video-viewer',
        type: 'video/webm'
      };
      return;
    } else if (Uti.getFileExtension(src).includes('mp4')) {
      this.cssClass = "video-viewer";
      this.options = {
        autoplay: false,
        bigPlayButton: true,
        muted: false,
        controls: true,
        autoSetup: true,
        preload: 'none',
        src: src,
        removeClass: 'audio-viewer',
        type: 'video/mp4'
        // poster: this.getPosterUrl(this.message)
      };
      return;
    }
  }

  private init() {
    this.player = videojs(this.target.nativeElement, this.options, this.playerReady.bind(this));

    if (this.options.src) {
      this.player.src({src: this.options.src, type: this.options.type});
    }
    if (this.options.poster) {
      this.player.poster(this.options.poster);
    }

    this.player.on('pause', this.pausePlayer.bind(this));
  }

  private pausePlayer($event) {
    if (!this.isClickPlayControl) return;

    this.isClickPlayControl = false;
    this.onPauseMedia($event);
  }

  private playerReady($event) {
    if (this.target.nativeElement.playerId) {
      if (this.cssClass && this.target.nativeElement.parentElement) {
        this.target.nativeElement.parentElement.classList.add(this.cssClass);
        this.target.nativeElement.parentElement.classList.remove(this.options.removeClass);
      }

      const el = document.getElementById(this.target.nativeElement.playerId);
      if (el) {
        const elPlayControl = el.querySelector('.vjs-play-control');
        if (elPlayControl) {
          elPlayControl.addEventListener('click', this.playControlOnClick.bind(this), false);
        }
      }
    }

    this.onPlayerReady($event);
  }

  private isClickPlayControl: boolean;
  private playControlOnClick($event) {
    if ($event) {
      this.isClickPlayControl = true;
    }
  }

}
