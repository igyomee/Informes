export type ModuleKey = 'clima' | 'puertas' | 'electrico';

export interface AppModule {
  key: ModuleKey;
  label: string;
  description: string;
  envUrl: string;
}

export const APP_MODULES: AppModule[] = [
  {
    key: 'clima',
    label: 'Clima',
    description: 'Clima',
    envUrl: import.meta.env.VITE_API_URL_CLIMA ?? ''
  },
  {
    key: 'puertas',
    label: 'Puertas',
    description: 'Puertas, muelles y barreras',
    envUrl: import.meta.env.VITE_API_URL_PUERTAS ?? ''
  },
  {
    key: 'electrico',
    label: 'Eléctrico',
    description: 'Baja tensión y equipos eléctricos',
    envUrl: import.meta.env.VITE_API_URL_ELECTRICO ?? ''
  }
];

export const DEFAULT_MODULE: ModuleKey = 'clima';
export const MODULE_STORAGE_KEY = 'maintenance_app_module';

export function getModuleByKey(key: string | null | undefined): AppModule {
  return APP_MODULES.find((module) => module.key === key) ?? APP_MODULES[0]!;
}
