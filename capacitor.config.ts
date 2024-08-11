import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.taxinow',
  appName: 'TaxiNow',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;