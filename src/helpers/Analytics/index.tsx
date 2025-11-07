import analytics from '@react-native-firebase/analytics';

interface LogEventData {
  [key: string]: any;
}

export const GoogleAnalytics = {
  async logEvent(key: string, data: LogEventData): Promise<void> {
    try {
      await analytics().logEvent(key, data);
    } catch (error) {
      // Handle the error here if needed.
      // console.error('Error logging event: ' + error.message);
    }
  },
};
