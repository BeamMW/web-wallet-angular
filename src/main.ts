import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import * as extensionizer from 'extensionizer';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));


extensionizer.runtime.sendMessage({text: 'wallet-opened'});

extensionizer.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.text === 'stop-loading') {
    window.stop();
  }
});

