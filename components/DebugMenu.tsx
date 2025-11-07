import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Business } from '../types/config';

interface DebugMenuProps {
  isVisible: boolean;
  onClose: () => void;
  business: Business | null;
  onRefreshConfig: () => Promise<void>;
  onSwitchBusiness: () => void;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'error' | 'warn';
  message: string;
}

export default function DebugMenu({ 
  isVisible, 
  onClose, 
  business,
  onRefreshConfig,
  onSwitchBusiness 
}: DebugMenuProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to console logs (in a real app, you'd have a logging service)
  useEffect(() => {
    // This would typically be connected to a logging service
    // For now, we'll just show static debug info
  }, []);

  const handleRefreshConfig = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshConfig();
      Alert.alert('Success', 'Configuration refreshed successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh configuration');
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const addLogEntry = (level: 'log' | 'error' | 'warn', message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      level,
      message,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  // Expose logging function globally for WebView logs
  useEffect(() => {
    (global as any).debugLog = addLogEntry;
    return () => {
      delete (global as any).debugLog;
    };
  }, []);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return '#e74c3c';
      case 'warn': return '#f39c12';
      default: return '#2c3e50';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString();
  };

  if (!__DEV__) {
    return null; // Only show in development
  }

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Debug Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#2c3e50" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Business Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Business</Text>
            {business ? (
              <View style={styles.businessInfo}>
                <Text style={styles.infoText}>ID: {business.id}</Text>
                <Text style={styles.infoText}>Name: {business.displayName}</Text>
                <Text style={styles.infoText}>URL: {business.storeUrl}</Text>
                <Text style={styles.infoText}>
                  Allowed Hosts: {business.allowedHosts.join(', ')}
                </Text>
                <Text style={styles.infoText}>
                  Primary Color: {business.primaryColor}
                </Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>No business selected</Text>
            )}
          </View>

          {/* Actions Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.actionButton, { opacity: isRefreshing ? 0.5 : 1 }]}
                onPress={handleRefreshConfig}
                disabled={isRefreshing}
              >
                <Ionicons name="refresh-outline" size={20} color="#3498db" />
                <Text style={[styles.actionButtonText, { color: '#3498db' }]}>
                  {isRefreshing ? 'Refreshing...' : 'Refresh Config'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={onSwitchBusiness}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color="#9b59b6" />
                <Text style={[styles.actionButtonText, { color: '#9b59b6' }]}>
                  Switch Business
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={clearLogs}
              >
                <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                <Text style={[styles.actionButtonText, { color: '#e74c3c' }]}>
                  Clear Logs
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Console Logs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>WebView Console</Text>
              <Text style={styles.logCount}>({logs.length})</Text>
            </View>
            
            {logs.length > 0 ? (
              <View style={styles.logsContainer}>
                {logs.map((log) => (
                  <View key={log.id} style={styles.logEntry}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logTimestamp}>
                        {formatTimestamp(log.timestamp)}
                      </Text>
                      <Text style={[
                        styles.logLevel, 
                        { color: getLevelColor(log.level) }
                      ]}>
                        {log.level.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.logMessage}>{log.message}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noDataText}>No console logs yet</Text>
            )}
          </View>

          {/* App Info Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Info</Text>
            <View style={styles.appInfo}>
              <Text style={styles.infoText}>Version: 1.0.0</Text>
              <Text style={styles.infoText}>Build: Development</Text>
              <Text style={styles.infoText}>
                Platform: {require('react-native').Platform.OS}
              </Text>
              <Text style={styles.infoText}>
                Timestamp: {new Date().toLocaleString()}
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#ffffff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  logCount: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  businessInfo: {
    gap: 6,
  },
  appInfo: {
    gap: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#34495e',
    fontFamily: 'monospace',
  },
  noDataText: {
    fontSize: 14,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  buttonGroup: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logsContainer: {
    maxHeight: 300,
  },
  logEntry: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f4',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#95a5a6',
    fontFamily: 'monospace',
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  logMessage: {
    fontSize: 13,
    color: '#2c3e50',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
});