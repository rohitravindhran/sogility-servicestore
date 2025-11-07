import { Business } from '@/types/config';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NavHeaderProps {
  business: Business;
  isVisible: boolean;
  showBackButton: boolean;
  onBackPress: () => void;
  onMenuPress?: () => void;
}

const NavHeader: React.FC<NavHeaderProps> = ({
  business,
  isVisible,
  showBackButton,
  onBackPress,
  onMenuPress,
}) => {
  console.log('NavHeader render - isVisible:', isVisible, 'business:', business.displayName);
  
  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.headerContainer}>
      <View style={styles.leftContent}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Always show Sogility logo */}
            <Image 
              source={require('../assets/images/sogility-logo.png')} 
              style={styles.logo} 
            />
            <Text style={styles.businessName}>{business.displayName}</Text>
          </>
        )}
      </View>
      {/* Removed three-dot menu completely */}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1000,
    height: 60,
    minHeight: 60,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '600',
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
    resizeMode: 'cover',
  },
  businessName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333333',
    flex: 1,
  },

});

export default NavHeader;