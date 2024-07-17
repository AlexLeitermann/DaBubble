import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CommonModule } from '@angular/common';
import { MessageItemComponent } from '../message-item/message-item.component';
import { MessageBoxComponent } from '../message-box/message-box.component';
import { TimeSeparatorComponent } from '../time-separator/time-separator.component';
import { ChannelsService } from '../../../services/content/channels.service';
import { Channel } from '../../../models/channel.class';
import { EditChannelComponent } from '../../edit-channel/edit-channel.component';
import { MatDialog } from '@angular/material/dialog';
import { ThreadComponent } from '../thread/thread.component';
import { Subscription } from 'rxjs';
import { Post } from '../../../models/post.class';
import { AuthService } from '../../../services/auth.service';
import { TimeService } from '../../../services/time.service';
import { User } from '../../../models/user.class';
import { MemberListComponent } from '../../member-list/member-list.component';
import { ActivityService } from '../../../services/activity.service';
import { Thread } from '../../../models/thread.class';

@Component({
  selector: 'app-main-chat',
  standalone: true,
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss'],
  imports: [
    CommonModule,
    PickerComponent,
    MessageItemComponent,
    MessageBoxComponent,
    TimeSeparatorComponent,
    ThreadComponent
  ]
})
export class MainChatComponent implements OnInit, OnDestroy {
  private authSub = new Subscription();
  private channelSub = new Subscription();

  currentUid: string | null = null;
  currentChannel = new Channel();
  currPost: Post | undefined;
  emojiPicker = false;
  activeUsers: User[] = [];
  currentDate: number = Date.now();

  constructor(
    private dialog: MatDialog,
    private authService: AuthService,
    private channelsService: ChannelsService,
    private activityService: ActivityService,
    public timeService: TimeService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }


  ngOnInit(): void {
    this.authSub = this.subAuth();
    this.route.queryParams.subscribe(params => {
      if (params['channel']) {
        this.initChannel(params['channel']);
      }
    });
    this.activeUsers = this.activityService.getActiveUsers();
  }


  subAuth(): Subscription {
    return this.authService.user$.subscribe(() => {
      const uid = this.authService.getCurrentUid();
      if (uid) {
        this.currentUid = uid;
      }
    });
  }


  initChannel(channel_id: string): void {
    this.setChannel(channel_id);
    this.channelSub.unsubscribe();
    this.channelSub = this.subChannel(channel_id);
  }


  setChannel(channel_id: string): void {
    const channel = this.channelsService.channels.find(c => c.channel_id === channel_id);
    if (channel) {
      this.currentChannel = channel;
    }
  }


  subChannel(channel_id: string): Subscription {
    return this.channelsService.channels$.subscribe(() => {
      this.setChannel(channel_id);
    });
  }


  isCurrentUserAuthor(): boolean {
    const firstPost = this.currentChannel.posts[0];
    return this.currentUid === firstPost.user_id;
  }


  handleEmojiStateChange(newState: boolean): void {
    this.emojiPicker = newState;
  }

  onCreatePost(message: string) {
    if (!this.currentUid) {
      console.error('Current user ID is not set.');
      return;
    }
    if (!this.currentChannel.channel_id) {
      console.error('Current channel ID is not set.');
      return;
    }

    this.channelsService.addPostToChannel(this.currentChannel.channel_id, this.currentUid, message)
      .then(() => console.log('Post successfully added to the channel'))
      .catch(err => console.error('Error adding post to the channel:', err));
  }



  onEditChannel(): void {
    this.dialog.open(EditChannelComponent);
  }


  openMemberList(): void {
    this.dialog.open(MemberListComponent, {
      data: { activeUsers: this.activeUsers }
    });
  }


  handleThread(threadId: string): void {
    if (this.currentChannel && this.currentChannel.posts) {
      const post = this.currentChannel.posts.find(post => post.thread.thread_id === threadId);
      if (!post) {
        console.error(`Thread with ID ${threadId} not found.`);
        this.currPost = undefined;
      } else {
        this.currPost = post;
      }
    } else {
      console.error('Current channel or posts are not defined.');
    }
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.channelSub.unsubscribe();
  }
}
