import React from 'react';
import {
    ActivityIndicator,
    Animated,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface ActionOverlayProps {
  isVisible?: boolean;
  visible?: boolean; // Support both prop names for compatibility
  actionType?: string;
  message?: string;
  error?: string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  onOpenInBrowser?: () => void;
  onCancel?: () => void;
}

const ActionOverlay: React.FC<ActionOverlayProps> = ({
  isVisible,
  visible,
  actionType = 'booking',
  message,
  error,
  onDismiss,
  onRetry,
  onOpenInBrowser,
  onCancel
}) => {
  // Support both isVisible and visible props for compatibility
  const shouldShow = isVisible ?? visible ?? false;
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const spinnerAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (shouldShow) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start();

      // Spinner rotation animation (only if no error)
      if (!error) {
        Animated.loop(
          Animated.timing(spinnerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          })
        ).start();
      }
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        })
      ]).start();
      
      // Stop spinner
      spinnerAnim.stopAnimation();
      spinnerAnim.setValue(0);
    }
  }, [shouldShow, error, fadeAnim, scaleAnim, spinnerAnim]);

  if (!shouldShow) {
    return null;
  }

  const spinnerRotation = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getActionMessage = () => {
    if (message) return message;
    
    switch (actionType) {
      case 'booking':
        return 'Processing your booking...';
      case 'checkout':
        return 'Processing checkout...';
      case 'payment':
        return 'Processing payment...';
      default:
        return 'Processing...';
    }
  };

  const handleDismiss = () => {
    if (error && onDismiss) {
      onDismiss();
    }
  };

  // Check if this is a timeout state (has retry/browser options)
  const hasTimeoutActions = onRetry || onOpenInBrowser || onCancel;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable 
        style={styles.overlayBackground}
        onPress={error && !hasTimeoutActions ? handleDismiss : undefined}
        disabled={!(error && !hasTimeoutActions)}
      >
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          {error && !hasTimeoutActions ? (
            // Error state (original behavior)
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>!</Text>
              </View>
              <Text style={styles.errorTitle}>Action Failed</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <Pressable style={styles.retryButton} onPress={handleDismiss}>
                <Text style={styles.retryButtonText}>Dismiss</Text>
              </Pressable>
            </View>
          ) : hasTimeoutActions ? (
            // Timeout state with action buttons
            <View style={styles.timeoutContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.timeoutMessage}>{getActionMessage()}</Text>
              
              <View style={styles.actions}>
                {onRetry && (
                  <TouchableOpacity style={styles.button} onPress={onRetry}>
                    <Text style={styles.buttonText}>Retry</Text>
                  </TouchableOpacity>
                )}
                
                {onOpenInBrowser && (
                  <TouchableOpacity style={styles.button} onPress={onOpenInBrowser}>
                    <Text style={styles.buttonText}>Open in browser</Text>
                  </TouchableOpacity>
                )}
                
                {onCancel && (
                  <TouchableOpacity style={[styles.button, styles.light]} onPress={onCancel}>
                    <Text style={[styles.buttonText, { color: '#333' }]}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            // Loading state (original behavior)
            <View style={styles.loadingContainer}>
              <Animated.View 
                style={[
                  styles.spinner,
                  { transform: [{ rotate: spinnerRotation }] }
                ]}
              >
                <View style={styles.spinnerInner} />
              </Animated.View>
              {/* <Text style={styles.loadingText}>{getActionMessage()}</Text> */}
            </View>
          )}
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000, // Increased z-index
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Darker background for better visibility
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 280,
    width: '78%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  spinner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    borderTopColor: '#6366F1',
    marginBottom: 16,
  },
  spinnerInner: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 20,
  },
  // Timeout state styles
  timeoutContainer: {
    alignItems: 'center',
  },
  timeoutMessage: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'space-between',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: 8,
    backgroundColor: '#0a8843',
  },
  light: {
    backgroundColor: '#eee',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  // Error state styles
  errorContainer: {
    alignItems: 'center',
  },
  errorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FECACA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  errorIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ActionOverlay;