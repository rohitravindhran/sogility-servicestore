import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

// Network provider services
class NetworkProvider {
  static connected = false;
  static unSubscribeNetwork: (() => void) | null = null;

  // Check for network
  static checkNetwork() {
    NetInfo.fetch().then((state: NetInfoState) => {
      NetworkProvider.connected = state.isConnected;
    });
  }

  // Subscribe to network change
  static subscribeNetwork() {
    NetworkProvider.unSubscribeNetwork = NetInfo.addEventListener((state: NetInfoState) => {
      console.log('Connection state', state);
      NetworkProvider.connected = state.isConnected;
    });
  }

  // Unsubscribe to network change
  static unSubscribeNetwork() {
    if (NetworkProvider.unSubscribeNetwork) {
      NetworkProvider.unSubscribeNetwork();
    }
  }
}

export default NetworkProvider;
