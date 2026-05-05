import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sakhisafety.app',
  appName: 'Sakhi Safety',
  webDir: 'dist',
  server: {
    // This points the APK to your live website
    url: 'https://shakthi-safety.vercel.app/', 
    cleartext: true
  }
};


export default config;
