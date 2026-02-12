import { enableProdMode, CSP_NONCE } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ENVIRONMENT_CONFIG } from './models/environmentConfig.model';

/* ①  Read the <meta name="csp-nonce"> placed by the server template */
const nonce =
  document.querySelector<HTMLMetaElement>('meta[name="csp-nonce"]')?.content ||
  '';

if (environment.production) {
  enableProdMode();
}

fetch('/api/configuration-ui/').then(async (response) => {
  let config = await response.json();
  config = config || {};
  platformBrowserDynamic([{ provide: ENVIRONMENT_CONFIG, useValue: config },
    { provide: CSP_NONCE, useValue: nonce }
  ])
    .bootstrapModule(AppModule)
    .catch((err) => console.log(err));
});
