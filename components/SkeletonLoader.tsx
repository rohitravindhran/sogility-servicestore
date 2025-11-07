import React from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

interface SkeletonLoaderProps {
  isLoading: boolean;
  showBottomMenu?: boolean;
  showHeader?: boolean;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  isLoading,
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
        <SkeletonItem width="35%" height={40} marginBottom={16} borderRadius={8} />
        
        {/* Subtitle block */}

        {/* Two medium horizontal blocks */}
        <SkeletonItem width="50%" height={30} marginBottom={16} borderRadius={8} />
        <SkeletonItem width="60%" height={30} marginBottom={40} borderRadius={8} />
        

        {/* Large main content area - matches screenshot height and position */}
        <SkeletonItem width="100%" height={135} marginBottom={50} borderRadius={12} />

        {/* Medium content block */}
        <SkeletonItem width="50%" height={30} marginBottom={25} borderRadius={12} />

        {/* Additional content blocks - matching screenshot layout */}
        <SkeletonItem width="60%" height={70} marginBottom={20} borderRadius={12} />
        <SkeletonItem width="60%" height={70} marginBottom={20} borderRadius={12} />
        <SkeletonItem width="60%" height={70} marginBottom={20} borderRadius={12} />
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
    paddingTop: 31,
    paddingBottom: 20,
  },
  skeletonItem: {
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
});export default SkeletonLoader;