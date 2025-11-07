import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface FullScreenSpinnerProps {
  isLoading: boolean;
  transparent?: boolean;
  color?: string;
  loaderStyle?: any;
  showBottomMenu?: boolean;
}

const FullScreenSpinner: React.FC<FullScreenSpinnerProps> = ({
  isLoading,
  transparent = true,
  color = '#007AFF',
  loaderStyle = {},
  showBottomMenu = false
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        transparent
          ? { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          : { backgroundColor: '#fff' },
        showBottomMenu && { bottom: 70 }, // Avoid bottom menu area (70px height)
      ]}>
      <ActivityIndicator
        size="large"
        color={color}
        style={[styles.loaderAnimationStyle, loaderStyle]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  loaderAnimationStyle: {
    width: 60,
    height: 60,
  },
});

export default FullScreenSpinner;