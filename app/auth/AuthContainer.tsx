import { Business } from '@/types/config';
import React, { createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import LoginScreen from './login';

type AuthScreen = 'login' | 'signup' | 'setPassword';

interface AuthContextType {
  business: Business;
  onAuthSuccess: (authData: any) => void;
  onBack?: () => void;
  navigateToScreen: (screen: AuthScreen, params?: any) => void;
  currentScreen: AuthScreen;
  screenParams: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthContainer');
  }
  return context;
};

interface AuthContainerProps {
  business: Business;
  onAuthSuccess: (authData: any) => void;
  onBack?: () => void;
}

export default function AuthContainer({ business, onAuthSuccess, onBack }: AuthContainerProps) {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const [screenParams, setScreenParams] = useState<any>(null);

  const navigateToScreen = (screen: AuthScreen, params?: any) => {
    setCurrentScreen(screen);
    setScreenParams(params || null);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen />;
      case 'signup':
        // For now, redirect back to login since we're using inline signup
        return <LoginScreen />;
      case 'setPassword':
        // For now, redirect back to login - this can be implemented later
        return <LoginScreen />;
      default:
        return <LoginScreen />;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        business, 
        onAuthSuccess, 
        onBack, 
        navigateToScreen, 
        currentScreen, 
        screenParams 
      }}
    >
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>
    </AuthContext.Provider>
  );
}