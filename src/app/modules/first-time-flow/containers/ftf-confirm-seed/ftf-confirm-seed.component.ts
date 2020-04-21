import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { Store, select } from '@ngrx/store';
import { selectWasmState } from '../../../../store/selectors/wallet-state.selectors';
import { Observable, Subscription, from } from 'rxjs';
import { WindowService } from '../../../../services';
import { routes } from '@consts';

@Component({
  selector: 'app-ftf-confirm-seed',
  templateUrl: './ftf-confirm-seed.component.html',
  styleUrls: ['./ftf-confirm-seed.component.scss']
})

export class FtfConfirmSeedComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public routesConsts = routes;

  private sub: Subscription;
  public isFullScreen = false;
  private seedState = [];
  public seedStateToConfirm = [];
  private seedConfirmed = false;

  private WORDS_TO_CONFIRM_COUNT = 6;

  constructor(
      private store: Store<any>,
      private windowService: WindowService,
      public router: Router) {
    this.isFullScreen = this.windowService.isFullSize();
    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {seed: string};
      this.seedState = state.seed.split(' ');

      const idsUsedToConfirm = [];
      while (idsUsedToConfirm.length !== this.WORDS_TO_CONFIRM_COUNT) {
        const newItemId = Math.floor(Math.random() * 12);
        if (idsUsedToConfirm.includes(newItemId)) {
          continue;
        } else {
          this.seedStateToConfirm.push({
            value: this.seedState[newItemId],
            index: newItemId,
            inProgress: false,
            confirmed: false
          });
          idsUsedToConfirm.push(newItemId);
        }
      }
    } catch (e) {
      this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
    }
  }
  ngOnInit() {
  }

  wordInputUpdated($event, word) {
    const valueFromInput = $event.target.value;
    if (valueFromInput === null || valueFromInput.length === 0) {
      word.confirmed = false;
      word.inProgress = false;
    } else if (valueFromInput !== null && valueFromInput === word.value) {
      word.confirmed = true;
      word.inProgress = false;
    } else if (valueFromInput !== null && valueFromInput !== word.value) {
      word.confirmed = false;
      word.inProgress = true;
    }
    this.checkConfirmationState();
  }

  checkConfirmationState() {
    let counter = 0;
    this.seedStateToConfirm.forEach(item => {
      if (item.confirmed) {
        counter++;
      }
    });

    this.seedConfirmed = counter === this.WORDS_TO_CONFIRM_COUNT;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([routes.FTF_VIEW_SEED_ROUTE]);
  }

  nextClicked() {
    if (this.seedConfirmed) {
      const navigationExtras: NavigationExtras = {
        state: {
          seedConfirmed: false,
          seed: this.seedState.join(' ')
        }
      };
      this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
    }
  }
}
