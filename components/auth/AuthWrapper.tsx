import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface AuthWrapperProps {
  title: string;
  pageNumber: number;
  userDetails?: any;
  children: ReactNode;
  showBreadcrumb?: boolean;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({
  title,
  children,
  pageNumber,
  userDetails,
  showBreadcrumb = true,
}) => {
  const router = useRouter();

  const onBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('../login');
    }
  };

  const jumpTo = (page: number) => {
    if (page >= pageNumber) {
      return;
    }
    switch (page) {
      case 1:
        router.push('./');
        break;
      case 2:
        if (userDetails) {
          router.push({
            pathname: './setPassword',
            params: { userDetails: JSON.stringify(userDetails) }
          });
        }
        break;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onBackPress}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>{title}</Text>
      </View>
      
      {showBreadcrumb && (
        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={styles.breadCrumbContainer}
            activeOpacity={1}
            onPress={() => jumpTo(1)}>
            <Text
              style={[
                styles.countText,
                pageNumber >= 1 && styles.activeCountText,
              ]}>
              {'1'}
            </Text>
            <Text
              style={[
                styles.screenName,
                pageNumber >= 1 && styles.activeScreenName,
              ]}>
              Details
            </Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.breadCrumbContainer}
            activeOpacity={1}
            onPress={() => jumpTo(2)}>
            <Text
              style={[
                styles.countText,
                pageNumber >= 2 && styles.activeCountText,
              ]}>
              {'2'}
            </Text>
            <Text
              style={[
                styles.screenName,
                pageNumber >= 2 && styles.activeScreenName,
              ]}>
              Password
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      <View style={styles.formContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    fontSize: 24,
    color: '#333333',
    marginRight: 15,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  navigationContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  breadCrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  countText: {
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    color: '#999999',
    textAlign: 'center',
    minWidth: 20,
    height: 20,
    lineHeight: Platform.OS === 'ios' ? 18 : 20,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activeCountText: {
    backgroundColor: '#007AFF',
    color: '#ffffff',
  },
  screenName: {
    fontSize: 14,
    marginLeft: 8,
    color: '#999999',
    fontWeight: '500',
  },
  activeScreenName: {
    color: '#333333',
  },
  arrowIcon: {
    fontSize: 16,
    color: '#999999',
    marginLeft: 8,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
});

export default AuthWrapper;