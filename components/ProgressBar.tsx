import React from 'react';
import {
    Animated,
    StyleSheet
} from 'react-native';

interface ProgressBarProps {
  progress: number; // 0 to 1
  isVisible: boolean;
  showHeader?: boolean;
  showSkeleton?: boolean; // Coordinate with skeleton loader
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  isVisible,
  showHeader = false,
  showSkeleton = false
}) => {
  const progressAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;
  const heightAnim = React.useRef(new Animated.Value(3)).current;

  React.useEffect(() => {
    if (isVisible) {
      // Show progress bar with enhanced visibility when skeleton is shown
      const targetOpacity = showSkeleton ? 0.9 : 1;
      const targetHeight = showSkeleton ? 4 : 3; // Slightly thicker when skeleton is active
      
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: targetOpacity,
          duration: 150,
          useNativeDriver: false,
        }),
        Animated.timing(heightAnim, {
          toValue: targetHeight,
          duration: 150,
          useNativeDriver: false,
        })
      ]).start();
    } else {
      // Hide progress bar with smooth completion animation
      const hideDelay = progress >= 1 ? 400 : 0; // Longer delay for complete loads
      
      if (progress >= 1) {
        // Animate to full width first, then fade out
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: false,
        }).start(() => {
          setTimeout(() => {
            Animated.parallel([
              Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: false,
              }),
              Animated.timing(heightAnim, {
                toValue: 3,
                duration: 300,
                useNativeDriver: false,
              })
            ]).start();
          }, hideDelay);
        });
      } else {
        // Immediate hide for incomplete loads
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(heightAnim, {
            toValue: 3,
            duration: 200,
            useNativeDriver: false,
          })
        ]).start();
      }
    }
  }, [isVisible, progress, showSkeleton, opacityAnim, heightAnim, progressAnim]);

  React.useEffect(() => {
    // Animate progress with smart easing
    const duration = progress === 0 ? 50 : progress >= 0.9 ? 200 : 150;
    
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: duration,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  // Enhanced color interpolation based on progress
  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 0.9, 1],
    outputRange: ['#6366F1', '#8B5CF6', '#10B981', '#059669'],
    extrapolate: 'clamp',
  });

  const containerStyle = [
    styles.container,
    showHeader && styles.containerWithHeader
  ];

  return (
    <Animated.View style={[containerStyle, { opacity: opacityAnim }]}>
      <Animated.View style={[styles.track, { height: heightAnim }]}>
        <Animated.View 
          style={[
            styles.fill,
            { 
              width: progressWidth,
              backgroundColor: progressColor
            }
          ]}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4, // Slightly taller to accommodate height animation
    zIndex: 9000,
  },
  containerWithHeader: {
    top: 60, // Below NavHeader
  },
  track: {
    height: 3,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    overflow: 'hidden',
    borderRadius: 2,
  },
  fill: {
    height: '100%',
    backgroundColor: '#6366F1', // Default color, will be overridden by animated color
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
    borderRadius: 2,
  },
});

export default ProgressBar;