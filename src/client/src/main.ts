import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { AgendaComponent } from './app/components/pages/agenda/agenda.component';

registerLocaleData(localeEsAr);

bootstrapApplication(AgendaComponent, appConfig).catch((err) => console.error(err));
