import { Injectable, inject, OnDestroy } from '@angular/core';
import { Firestore, collection, doc, onSnapshot, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Subject } from 'rxjs';
import { CollectionReference, DocumentReference, addDoc } from 'firebase/firestore';
import { Channel } from '../../models/channel.class';
import { User } from '../../models/user.class';


@Injectable({
  providedIn: 'root'
})
export class ChannelsService implements OnDestroy {
  channels: Channel[] = [];
  channels$: Subject<Channel[]> = new Subject<Channel[]>();
  unsubChannels;
  firestore: Firestore = inject(Firestore);


  /**
   * Create subscription
   */
  constructor() {
    this.unsubChannels = this.subChannels();
  }


  /**
   * Unsubscribe
   */
  ngOnDestroy() {
    this.unsubChannels();
  }


  subChannels() {
    return onSnapshot(this.getColRef(), (list: any) => {
      let channels: Channel[] = [];
      list.forEach((element: any) => {
        channels.push(element.data());
      });
      this.channels = channels;
      this.channels$.next(channels);
    });
  }


  /**
   * Get reference to Firestore "channels" collection
   * @returns reference
   */
  getColRef(): CollectionReference {
    return collection(this.firestore, 'channels');
  }


  /**
   * Get reference to single doc Firestore data
   * @param id - Firestore task ID
   * @returns reference
   */
  getSingleDocRef(uid: string): DocumentReference {
    return doc(this.getColRef(), uid);
  }


  /**
   * Add doc to Firestore collection.
   * The Firestore document ID will be identical to the doc's Firebase authentication ID.
   * @param doc - doc to be added
   */
  async addDoc(channel: Channel): Promise<string> {
    await addDoc(this.getColRef(), channel.toJson())
      .then((response: any) => {
        channel.channel_id = response.id;
        this.updateDoc(channel);
      })
      .catch((err: Error) => { console.error(err) });
    return channel.channel_id;
  }


  /**
   * Update doc in Firestore collection.
   * The update will only be executed if the doc (i.e., its Firestore ID) exists in the Firestore collection.
   * @param doc - doc to be updated
   */
  async updateDoc(channel: Channel) {
    if (channel.channel_id) {
      const docRef = this.getSingleDocRef(channel.channel_id);
      await updateDoc(docRef, channel.toJson())
        .catch((err: Error) => { console.error(err) });
    }
  }


  /**
   * Delete doc from Firestore collection
   * @param channel_id - Firestore doc ID of doc to be deleted
   */
  async deleteDoc(channel_id: string) {
    const docRef = this.getSingleDocRef(channel_id);
    await deleteDoc(docRef)
      .catch((err: Error) => { console.error(err) });
  }


  async initUserChannels(user: User) {
    await this.initTeamChannel(user);
  }

  async initTeamChannel(user: User) {
    const teamChannels: Channel[] = this.channels.filter(c => c.name == 'Team');
    if (teamChannels.length > 0) {
      teamChannels.sort((a, b) => a.date - b.date);
      await this.addUserToChannel(user, teamChannels[0]);
    } else {
      await this.addDoc(new Channel(this.getTeamChannelData(user)))
    }
  }

  getTeamChannelData(user: User): any {
    return {name: 'Team',
      description: 'Dieser Channel steht dem gesamten Team offen. Hier kannst du zusammen mit deinem Team Meetings abhalten, Dokumente teilen und Entscheidungen treffen.',
      author_uid: user.uid,
      members_uids: [user.uid],
      date: Date.now(),
      isPmChannel: false}
  }

  async addUserToChannel(user: User, channel: Channel) {
    channel.members_uids.push(user.uid);
    await this.updateDoc(channel);
  }


  // const selfChannel = new Channel({
  //   'name': user.name,
  //   'author_uid': user.uid,
  //   'description': 'Benutze diesen Kanal für deine eigenen Notizen und Uploads.',
  //   'members_uids': [user.uid]
  // });
  // await this.addDoc(selfChannel)
  //   .catch((err: Error) => { console.error(err) });
}
