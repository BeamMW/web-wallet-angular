import { Component, OnInit } from '@angular/core';
import { environment } from '@environment';
import { Router, NavigationExtras } from '@angular/router';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { routes } from '@consts';
import { 
  WindowService, 
  DataService,
  WasmService
 } from '@app/services';
 import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-ftf-restore',
  templateUrl: './ftf-restore.component.html',
  styleUrls: ['./ftf-restore.component.scss']
})
export class FtfRestoreComponent implements OnInit {
  public iconBack: string = `${environment.assetsPath}/images/modules/send/containers/send-addresses/icon-back.svg`;
  public routesConsts = routes;
  public seedStateToConfirm = [];
  private seedConfirmed = false;
  public restoreForm: FormGroup;
  private WORDS_TO_RESTORE_COUNT = 12;

  public componentSettings = {
    isFullScreen: false,
    backLink: '',
    nextLink: '',
    popupOpened: false,
    fromLink: ''
  };

  constructor(
      private windowService: WindowService,
      private wasmService: WasmService,
      private dataService: DataService,
      public router: Router) {
    this.componentSettings.isFullScreen = this.windowService.isFullSize();

    dataService.changeEmitted$.subscribe(emittedState => {
      if (emittedState.popupOpened !== undefined) {
        this.componentSettings.popupOpened = emittedState.popupOpened;
      }
    });

    try {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation.extras.state as {
        from: string
      };
      this.componentSettings.fromLink = state.from;
    } catch (e) {
    }

    let counter = 0;
    while (counter !== this.WORDS_TO_RESTORE_COUNT) {
      this.seedStateToConfirm.push({
        index: counter,
        value: '',
        inProgress: false,
        confirmed: false
      });
      ++counter;
    }
    this.restoreForm = this.getForm();
  }

  getFormGroupForLine(line: any): FormGroup {
    return new FormGroup({
      word: new FormControl(line.value)
    })
  }

  getForm(): FormGroup {
    return new FormGroup({
      wordLines: new FormArray(this.seedStateToConfirm.map(this.getFormGroupForLine))
    })
  }

  ngOnInit() {
    this.restoreForm.get('wordLines').valueChanges.pipe(debounceTime(300)).subscribe(newValue => {
      for(let [index, item] of newValue.entries()) {
        const word = item.word;
        let seedItem = this.seedStateToConfirm[index];
        if (word === null || word.length === 0) {
          seedItem.confirmed = false;
          seedItem.inProgress = false;
        } else {
          if (word !== null && this.wasmService.isAllowedWord(word)) {
            seedItem.confirmed = true;
            seedItem.inProgress = false;
          } else if (word !== null && !this.wasmService.isAllowedWord(word)) {
            seedItem.confirmed = false;
            seedItem.inProgress = true;
          }
          seedItem.value = word;
        }
      }
      this.checkConfirmationState();
    });
  }

  checkConfirmationState() {
    let counter = 0;
    this.seedStateToConfirm.forEach(item => {
      if (item.confirmed) {
        counter++;
      }
    });

    this.seedConfirmed = counter === this.WORDS_TO_RESTORE_COUNT;
  }

  backClicked(event) {
    event.stopPropagation();
    this.router.navigate([this.componentSettings.fromLink])
  }

  private insertPhrase(phrase: string[]) {
    const wordLines = this.restoreForm.get('wordLines') as FormArray;
    for(let [index, word] of phrase.entries()) {
      wordLines.controls[index].get('word').setValue(word);
    }
  }

  public restoreClicked() {
    if (this.seedConfirmed) {
      this.dataService.clearWalletData();
      this.dataService.getCoinsState.putState(false);
      let seedWords = [];
      this.seedStateToConfirm.forEach(item => {
        seedWords.push(item.value);
      });

      const navigationExtras: NavigationExtras = {
        state: {
          seedConfirmed: false,
          seed: seedWords.join(' '),
          from: routes.FTF_WALLET_RESTORE_ROUTE
        }
      };
      this.router.navigate([routes.FTF_PASSWORD_CREATE_ROUTE], navigationExtras);
    }
  }

  public onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let pastedText = clipboardData.getData('text');
    let parsedText = pastedText.split(' ');
    if (parsedText.length === this.WORDS_TO_RESTORE_COUNT) {
      this.insertPhrase(parsedText);
      event.preventDefault();
    }

    parsedText = pastedText.split(';');
    parsedText.pop();
    if (parsedText.length === this.WORDS_TO_RESTORE_COUNT) {
      this.insertPhrase(parsedText);
      event.preventDefault();
    }
  }
}
