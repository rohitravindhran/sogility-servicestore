import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';

interface SkeletonLoaderProps {
  isLoading: boolean;
  mode?: 'full' | 'overlay';
  showBottomMenu?: boolean;
  showHeader?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isLoading,
  mode = 'full',
  showBottomMenu = false,
  showHeader = false
}) => {
  const shimmerAnim = React.useRef(new Animated.Value(0)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (isLoading) {
      // Start subtle pulse animation for skeleton items
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Start smooth progress bar animation
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      ).start();
    } else {
      shimmerAnim.stopAnimation();
      progressAnim.stopAnimation();
      shimmerAnim.setValue(0);
      progressAnim.setValue(0);
    }
  }, [isLoading, shimmerAnim, progressAnim]);

  if (!isLoading) {
    return null;
  }

  const pulseOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  const progressColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#6366F1', '#8B5CF6', '#10B981'],
    extrapolate: 'clamp',
  });

  // Top loading bar component
  const TopLoadingBar = () => (
    <View style={[styles.topLoadingContainer, showHeader && styles.topLoadingWithHeader]}>
      <View style={styles.topLoadingTrack}>
        <Animated.View 
          style={[
            styles.topLoadingFill,
            { 
              width: progressWidth,
              backgroundColor: progressColor
            }
          ]}
        />
      </View>
    </View>
  );

  const SkeletonItem: React.FC<{ 
    width: string | number; 
    height: number; 
    marginBottom?: number;
    borderRadius?: number;
  }> = ({ 
    width, 
    height, 
    marginBottom = 12,
    borderRadius = 8
  }) => (
    <Animated.View 
      style={[
        styles.skeletonItem, 
        { 
          width: width as any, 
          height, 
          marginBottom,
          borderRadius,
          opacity: pulseOpacity
        }
      ]}
    />
  );

  if (mode === 'overlay') {
    return (
      <>
        {/* Top loading bar for overlay mode */}
        <TopLoadingBar />
        <View style={styles.overlayContainer}>
          <View style={styles.overlayBackground}>
            <View style={styles.overlaySpinner}>
              <Animated.View 
                style={[
                  styles.spinnerCircle,
                  { opacity: pulseOpacity }
                ]}
              />
            </View>
          </View>
        </View>
      </>
    );
  }

  // Full mode (original behavior)
  // Calculate container positioning based on navbar and bottom menu
  const containerStyle = {
    ...styles.container,
    ...(showHeader && { top: 60 }), // Navbar height
    ...(showBottomMenu && { bottom: 70 }), // Bottom menu height
  };

  return (
    <>
      {/* Top loading bar for full mode */}
      <TopLoadingBar />
      <View style={containerStyle}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
        {/* Header title block - matches screenshot exactly */}
        <SkeletonItem width="35%" height={50} marginBottom={30} borderRadius={8} />
        
        {/* Subtitle block */}

        {/* Two medium horizontal blocks */}
        <SkeletonItem width="43%" height={32} marginBottom={10} borderRadius={8} />
        <SkeletonItem width="48%" height={32} marginBottom={30} borderRadius={8} />
        

        {/* Large main content area - matches screenshot height and position */}
        <SkeletonItem width="100%" height={152} marginBottom={58} borderRadius={12} />

        {/* Medium content block */}
        <SkeletonItem width="40%" height={30} marginBottom={20} borderRadius={5} />

        {/* Additional content blocks - matching screenshot layout */}
        <SkeletonItem width="50%" height={65} marginBottom={12} borderRadius={12} />
        <SkeletonItem width="50%" height={65} marginBottom={12} borderRadius={12} />
        <SkeletonItem width="50%" height={65} marginBottom={20} borderRadius={12} />
        <SkeletonItem width="100%" height={80} marginBottom={30} borderRadius={12} />

        {/* Final bottom block - matches screenshot */}
        <SkeletonItem width="100%" height={100} marginBottom={20} borderRadius={12} />
      </ScrollView>
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 9999,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 20,
  },
  skeletonItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 8000,
  },
  overlayBackground: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlaySpinner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  // Top loading bar styles (replaces ProgressBar)
  topLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10000,
  },
  topLoadingWithHeader: {
    top: 60, // Below NavHeader
  },
  topLoadingTrack: {
    height: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    overflow: 'hidden',
    borderRadius: 2,
  },
  topLoadingFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 2,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 3,
  },
});export default SkeletonLoader;