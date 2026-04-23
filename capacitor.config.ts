import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.porshi.app',
  appName: 'Porsh',
  webDir: 'dist',
  server: {
    url: 'https://porshi.vercel.app',
    allowNavigation: ['porshi.vercel.app'],
    androidScheme: 'https'
  }
};

export default config;
