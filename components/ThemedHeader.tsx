import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Business } from '../types/config';

interface ThemedHeaderProps {
  business: Business;
  onLogoLongPress?: () => void;
  isVisible?: boolean;
}

// Helper function to determine if color is light or dark
const isColorLight = (color: string): boolean => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

export default function ThemedHeader({ 
  business, 
  onLogoLongPress,
  isVisible = true 
}: ThemedHeaderProps) {
  const insets = useSafeAreaInsets();
  const isLightColor = isColorLight(business.primaryColor);
  
  if (!isVisible) {
    return (
      <>
        <StatusBar 
          style="auto" 
          backgroundColor={business.primaryColor}
        />
        <View style={[styles.statusBarSpacer, { 
          height: insets.top, 
          backgroundColor: business.primaryColor 
        }]} />
      </>
    );
  }

  return (
    <>
      <StatusBar 
        style={isLightColor ? "dark" : "light"} 
        backgroundColor={business.primaryColor}
      />
      <View style={[
        styles.container,
        {
          backgroundColor: business.primaryColor,
          paddingTop: insets.top,
        }
      ]}>
        <View style={styles.content}>
          <TouchableOpacity
            onLongPress={onLogoLongPress}
            style={styles.logoContainer}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: business.logoUrl }}
              style={styles.logo}
              defaultSource={require('../assets/images/icon.png')}
            />
          </TouchableOpacity>
          
          <View style={styles.textContainer}>
            <Text 
              style={[
                styles.businessName,
                { color: isLightColor ? '#2c3e50' : '#ffffff' }
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {business.displayName}
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  statusBarSpacer: {
    width: '100%',
  },
  container: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
      android: {
        fontFamily: 'Roboto',
      },
    }),
  },
});