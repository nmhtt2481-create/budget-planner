import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'ru.budgetplanner.app',
  appName: 'Бюджет',
  webDir: 'dist',
  backgroundColor: '#F7F8FA',
  android: {
    allowMixedContent: false,
    backgroundColor: '#F7F8FA',
  },
  server: {
    androidScheme: 'https',
  },
}

export default config