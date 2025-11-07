import { Business } from '@/types/config';
import React, { createContext, useContext } from 'react';
import { View } from 'react-native';
import LoginScreen from './login';

interface AuthContextType {
  business: Business;
  onAuthSuccess: (authData: any) => void;
  onBack?: () => void;
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
  return (
    <AuthContext.Provider value={{ business, onAuthSuccess, onBack }}>
      <View style={{ flex: 1 }}>
        <LoginScreen />
      </View>
    </AuthContext.Provider>
  );
}