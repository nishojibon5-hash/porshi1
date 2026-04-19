import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.porshi.app',
  appName: 'Porshi',
  webDir: 'dist',
  server: {
    url: 'https://porshi.vercel.app',
    allowNavigation: ['porshi.vercel.app'],
    androidScheme: 'https'
  }
};

export default config;
