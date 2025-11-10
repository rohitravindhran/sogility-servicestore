import React from 'react';
import {
    Animated,
    StyleSheet,
    View
} from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  isVisible: boolean;
  showHeader?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isVisible,
  showHeader = false
}) => {
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isVisible) {
      // Show progress bar
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      // Hide progress bar with delay for smooth completion
      const hideDelay = progress >= 1 ? 300 : 0;
      setTimeout(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      }, hideDelay);
    }
  }, [isVisible, progress, opacityAnim]);

  React.useEffect(() => {
    // Animate progress
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const containerStyle = [
    styles.container,
    showHeader && styles.containerWithHeader
  ];

  return (
    <Animated.View style={[containerStyle, { opacity: opacityAnim }]}>
      <View style={styles.track}>
        <Animated.View 
          style={[
            styles.fill,
            { width: progressWidth }
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 9000,
  },
  containerWithHeader: {
    top: 60, // Below NavHeader
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ProgressBar;