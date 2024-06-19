import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { FlexLayoutServerModule } from '@angular/flex-layout/server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    FlexLayoutServerModule
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);