import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types/config';

interface OfflineErrorScreenProps {
  business: Business;
  error?: any;
  onRetry: () => void;
  onRefreshConfig?: () => void;
}

export default function OfflineErrorScreen({ 
  business, 
  error, 
  onRetry,
  onRefreshConfig 
}: OfflineErrorScreenProps) {
  
  const getErrorMessage = () => {
    if (!error) return 'Unable to connect';
    
    if (error.code === -1009 || error.description?.includes('offline')) {
      return 'You appear to be offline';
    }
    
    if (error.code === -1003 || error.description?.includes('could not find host')) {
      return 'Server not found';
    }
    
    if (error.code === -1001 || error.description?.includes('timeout')) {
      return 'Connection timeout';
    }
    
    return error.description || 'Connection failed';
  };

  const getErrorDescription = () => {
    if (!error) return 'Please check your internet connection and try again.';
    
    if (error.code === -1009 || error.description?.includes('offline')) {
      return 'Check your internet connection and try again.';
    }
    
    if (error.code === -1003 || error.description?.includes('could not find host')) {
      return 'The service store is temporarily unavailable. Please try again later.';
    }
    
    if (error.code === -1001 || error.description?.includes('timeout')) {
      return 'The connection is taking too long. Please check your internet and try again.';
    }
    
    return 'Something went wrong while loading the store. Please try again.';
  };

  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    if (!error) return 'cloud-offline-outline';
    
    if (error.code === -1009 || error.description?.includes('offline')) {
      return 'wifi-outline';
    }
    
    if (error.code === -1003 || error.description?.includes('could not find host')) {
      return 'server-outline';
    }
    
    if (error.code === -1001 || error.description?.includes('timeout')) {
      return 'time-outline';
    }
    
    return 'alert-circle-outline';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={getIconName()} 
            size={64} 
            color="#95a5a6" 
          />
        </View>
        
        <Text style={styles.title}>
          {getErrorMessage()}
        </Text>
        
        <Text style={styles.description}>
          {getErrorDescription()}
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.retryButton, { 
              backgroundColor: business.primaryColor 
            }]}
            onPress={onRetry}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={20} color="#ffffff" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          
          {onRefreshConfig && (
            <TouchableOpacity
              style={[styles.button, styles.configButton]}
              onPress={onRefreshConfig}
              activeOpacity={0.8}
            >
              <Ionicons name="settings-outline" size={20} color={business.primaryColor} />
              <Text style={[styles.configButtonText, { 
                color: business.primaryColor 
              }]}>
                Refresh Config
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        {error && __DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info:</Text>
            <Text style={styles.debugText}>
              Code: {error.code || 'N/A'}
            </Text>
            <Text style={styles.debugText}>
              Description: {error.description || 'N/A'}
            </Text>
            <Text style={styles.debugText}>
              URL: {error.url || business.storeUrl}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  retryButton: {
    // backgroundColor set dynamically
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  configButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  configButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  debugContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
});