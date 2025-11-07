import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { ConfigService } from '../services/ConfigService';
import { StorageService } from '../services/StorageService';
import { Business } from '../types/config';
import { getAppDisplayName, getBuildBusinessId, hasBuildBusinessId } from '../utils/buildConfig';

interface BusinessSelectionScreenProps {
  onBusinessSelected: (business: Business) => void;
}

export default function BusinessSelectionScreen({ onBusinessSelected }: BusinessSelectionScreenProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const configService = ConfigService.getInstance();

  useEffect(() => {
    loadBusinesses();
  }, []);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      // Load configuration (with built-in fallback to bundled config)
      const businessList = await configService.loadConfig();
      
      if (businessList.length === 0) {
        throw new Error('No businesses found in configuration');
      }
      
      setBusinesses(businessList);
      
      // Log which config source was used
      const configSource = configService.getConfigSource();
      console.log(`✓ Configuration loaded from ${configSource} source`);
      
    } catch (err) {
      console.error('Failed to load businesses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load businesses';
      
      // Provide user-friendly error messages
      if (errorMessage.includes('Network request failed')) {
        setError('Unable to connect to configuration server. Using offline mode.');
      } else if (errorMessage.includes('timeout')) {
        setError('Connection timeout. Please check your internet connection.');
      } else if (errorMessage.includes('No businesses found')) {
        setError('No business configurations available. Please contact support.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Force refresh from remote (will fall back to bundled if remote fails)
      const businessList = await configService.refreshConfig();
      setBusinesses(businessList);
      
      const configSource = configService.getConfigSource();
      console.log(`✓ Configuration refreshed from ${configSource} source`);
      
    } catch (err) {
      console.error('Failed to refresh configuration:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh configuration';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessSelection = async (business: Business) => {
    try {
      await StorageService.saveSelectedBusinessId(business.id);
      onBusinessSelected(business);
    } catch (error) {
      console.error('Failed to save business selection:', error);
      Alert.alert('Error', 'Failed to save your selection. Please try again.');
    }
  };

  const renderBusinessCard = ({ item }: { item: Business }) => (
    <TouchableOpacity
      style={[styles.businessCard, { borderColor: item.primaryColor }]}
      onPress={() => handleBusinessSelection(item)}
      activeOpacity={0.8}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: item.logoUrl }}
          style={styles.logo}
          defaultSource={require('../assets/images/icon.png')}
        />
      </View>
      <View style={styles.businessInfo}>
        <Text style={styles.businessName}>{item.displayName}</Text>
        <View style={[styles.openButton, { backgroundColor: item.primaryColor }]}>
          <Text style={styles.openButtonText}>Open Store</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={styles.loadingText}>Loading businesses...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Unable to load businesses</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBusinesses}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshConfiguration}>
            <Text style={styles.refreshButtonText}>Refresh Config</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show a notice if this build is configured for a specific business (shouldn't normally show)
  if (hasBuildBusinessId()) {
    const buildBusinessId = getBuildBusinessId();
    const businessIdString = typeof buildBusinessId === 'string' ? buildBusinessId : String(buildBusinessId || 'unknown');
    const appName = getAppDisplayName(businessIdString);
    
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.centered}>
          <Text style={styles.buildNoticeTitle}>{appName}</Text>
          <Text style={styles.buildNoticeText}>
            This app is configured for {appName} but the business configuration could not be loaded.
          </Text>
          <Text style={styles.buildNoticeSubtext}>
            Build ID: {businessIdString}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBusinesses}>
            <Text style={styles.retryButtonText}>Reload Configuration</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshConfiguration}>
            <Text style={styles.refreshButtonText}>Force Refresh</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <Text style={styles.title}>Select Your Service Store</Text>
        <Text style={styles.subtitle}>Choose a business to access their services</Text>
        
        <FlatList
          data={businesses}
          renderItem={renderBusinessCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#7f8c8d',
    marginBottom: 30,
  },
  list: {
    paddingBottom: 20,
  },
  businessCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    resizeMode: 'cover',
  },
  businessInfo: {
    alignItems: 'center',
  },
  businessName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  openButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 140,
  },
  openButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#e74c3c',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#34495e',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 12,
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buildNoticeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  buildNoticeText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  buildNoticeSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
});