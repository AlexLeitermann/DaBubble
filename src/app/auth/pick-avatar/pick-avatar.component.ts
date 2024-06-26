import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LegalFooterComponent } from '../legal-footer/legal-footer.component';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'app-pick-avatar',
  standalone: true,
  imports: [FormsModule, RouterLink, LegalFooterComponent],
  templateUrl: './pick-avatar.component.html',
  styleUrl: './pick-avatar.component.scss'
})
export class PickAvatarComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private storageService = inject(StorageService);
  user = {
    uid: 'testUID', // delete value later
    name: '...'
  }
  userSub = new Subscription();
  avatarSrc: string = 'assets/img/profile_blank.svg';
  customFile: any = '';

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe((user) => {
      if (user && user.displayName) {
        const uid = this.authService.getCurrentUid();
        if (uid) { this.user.uid = uid };
        this.user.name = user.displayName;
      }
    })
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  selectDefaultAvatar(index: string) {
    this.avatarSrc = `assets/img/avatar/avatar_${index}.svg`;
  }

  onCustomSelection(e: Event) {
    // implement user feedback in case file is invalid (no image)
    // disable Submit-Button while uploading
    const input = e.target as HTMLInputElement;
    if (input.files) {
      this.storageService.uploadAvatar(input.files[0], this.user.uid);
    }
  }

  unselectAvatar() {
    this.avatarSrc = 'assets/img/profile_blank.svg';
  }
}
