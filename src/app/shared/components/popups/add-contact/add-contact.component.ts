import { Component, OnInit, OnDestroy } from '@angular/core';
import {Router} from '@angular/router';
import { DataService, WindowService } from './../../../../services';
import { Subscription, Observable } from 'rxjs';
import { environment } from '@environment';
import { FormGroup, FormControl} from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  saveContact,
} from './../../../../store/actions/wallet.actions';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent implements OnInit, OnDestroy {
  sub: Subscription;
  isFullScreen = false;
  contactForm: FormGroup;
  address: string;

  constructor(private windowSerivce: WindowService,
              private store: Store<any>,
              public router: Router,
              private activatedRoute: ActivatedRoute,
              private dataService: DataService) {
    this.isFullScreen = windowSerivce.isFullSize();
    this.contactForm = new FormGroup({
      name: new FormControl()
    });
  }

  ngOnInit() {
    this.dataService.emitChange({popupOpened: true});
    this.activatedRoute
        .params
        .subscribe(params => {
            this.address = params['address'];
        });
  }

  ngOnDestroy() {
    this.dataService.emitChange({popupOpened: false});
    if (this.sub !== undefined) {
      this.sub.unsubscribe();
    }
  }

  submit($event) {
    $event.stopPropagation();
    this.store.dispatch(saveContact({name: this.contactForm.value.name, address: this.address}));
    this.dataService.saveWalletContacts();
    this.dataService.emitChange({popupOpened: false});
    this.closePopup();
  }

  cancelClicked($event) {
    $event.stopPropagation();
    this.closePopup();
  }

  closePopup() {
    this.router.navigate([{ outlets: { popup: null }}], {relativeTo: this.activatedRoute.parent});
  }
}
