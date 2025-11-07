import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MenuItem {
  label: string;
  route: string;
  iconName: string;
}

interface BottomMenuProps {
  isVisible: boolean;
  currentRoute: string;
  onTabPress: (route: string) => void;
}

// Icon component using Ionicons for professional iOS-style icons
const Icon: React.FC<{ name: string; isActive: boolean; size?: number }> = ({ 
  name, 
  isActive, 
  size = 24 
}) => {
  const getIconName = (iconName: string): keyof typeof Ionicons.glyphMap => {
    switch (iconName) {
      case 'home':
        return 'home-outline';
      case 'sessions':
        return 'calendar-outline';
      case 'memberships':  
        return 'card-outline';
      case 'account':
        return 'person-circle-outline';
      default:
        return 'help-outline';
    }
  };

  const color = isActive ? '#34C759' : '#8E8E93';

  return (
    <Ionicons 
      name={getIconName(name)} 
      size={size} 
      color={color}
    />
  );
};

const BottomMenu: React.FC<BottomMenuProps> = ({
  isVisible,
  currentRoute,
  onTabPress,
}) => {
  console.log('BottomMenu render - isVisible:', isVisible, 'currentRoute:', currentRoute);
  
  // Define the menu items matching the design in the image (removed Orders tab)
  const menuItems: MenuItem[] = [
    { 
      label: 'Home', 
      route: 'home', 
      iconName: 'home'
    },
    { 
      label: 'Sessions', 
      route: 'schedules', 
      iconName: 'sessions'
    },
    { 
      label: 'Memberships', 
      route: 'subscriptions', 
      iconName: 'memberships'
    },
    { 
      label: 'Account', 
      route: 'profile', 
      iconName: 'account'
    },
  ];

  console.log('BottomMenu rendering with', menuItems.length, 'items');

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.tabBar}>
      {menuItems.map((item, index) => {
        const isActive = currentRoute === item.route || 
          (item.route === 'home' && currentRoute === 'home') ||
          (item.route === 'schedules' && currentRoute === 'schedules') ||
          (item.route === 'subscriptions' && currentRoute === 'subscriptions') ||
          (item.route === 'profile' && currentRoute === 'profile');
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.tabItem}
            onPress={() => onTabPress(item.route)}
            activeOpacity={0.6}
          >
            <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
              <Icon name={item.iconName} isActive={isActive} size={26} />
            </View>
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8, // Reduced bottom padding significantly
    paddingHorizontal: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#E5E5E7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
    height: 75, // Slightly increased height for better touch targets
    minHeight: 75,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    minWidth: 50, // Increased minimum width for better touch area
    flex: 1,
  },
  iconContainer: {
    width: 36, // Increased icon container size
    height: 30, // Increased icon container height
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 3,
  },
  activeIconContainer: {
    // No background for active state to match native design
  },

  label: {
    fontSize: 11, // Slightly increased font size for better readability
    color: '#8E8E93', // iOS gray color for inactive
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 12,
    marginTop: 2,
  },
  activeLabel: {
    color: '#34C759', // iOS green color for active (matches the image)
    fontWeight: '600',
  },
});

export default BottomMenu;