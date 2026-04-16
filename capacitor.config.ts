import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.porshi.app',
  appName: 'Porshi',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
