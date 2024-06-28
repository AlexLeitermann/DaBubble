import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { MainUserProfileCardComponent } from '../main-user-profile-card/main-user-profile-card.component';


@Component({
  selector: 'app-edit-user-log-out-card',
  standalone: true,
  imports: [
    RouterLink,
    MatDialogModule
  ],
  providers: [
    //  {
    //    provide: MatDialogRef,
    //    useValue: []
    //  }
  ],
  templateUrl: './edit-user-log-out-card.component.html',
  styleUrl: './edit-user-log-out-card.component.scss'
})
export class EditUserLogOutCardComponent {
  constructor(
    public dialogRef: MatDialogRef<EditUserLogOutCardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogUserRef: MatDialogRef<MainUserProfileCardComponent>,
    public dialog: MatDialog
  ) {
    console.log('LogOut-Card..constr. data:', data);
  }

  openProfile() {
    this.dialogUserRef = this.dialog.open(MainUserProfileCardComponent, {
      data: {
        mainUser: this.data.mainUser
      }
    });

    this.dialogUserRef.afterClosed().subscribe(result => {
      console.log('The dialog "MainUserProfileCard" was Closed.', result); // remove later
    });
  }

  logMeOut() {
    this.dialogRef.close('logout');
  }
}
