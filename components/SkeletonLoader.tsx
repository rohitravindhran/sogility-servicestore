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

  React.useEffect(() => {
    if (isLoading) {
      // Start subtle pulse animation
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
    } else {
      shimmerAnim.stopAnimation();
      shimmerAnim.setValue(0);
    }
  }, [isLoading, shimmerAnim]);

  if (!isLoading) {
    return null;
  }

  const pulseOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8],
  });

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
});export default SkeletonLoader;