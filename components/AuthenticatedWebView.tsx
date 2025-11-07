import { Business } from '@/types/config';
import React from 'react';
import WebViewShell from './WebViewShell';

interface AuthenticatedWebViewProps {
  business: Business;
  authData: any;
  onError: (error: any) => void;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onNavigationStateChange?: (navState: any) => void;
  onLogout?: () => void;
}

export default function AuthenticatedWebView({
  business,
  authData,
  onError,
  onLoadStart,
  onLoadEnd,
  onNavigationStateChange,
  onLogout
}: AuthenticatedWebViewProps) {
  console.log('AuthenticatedWebView rendering with authData:', authData);

  // Pass the business and authentication data to WebViewShell
  // The WebViewShell handles all the UI (header, bottom menu) and navigation
  return (
    <WebViewShell
      business={business}
      onError={onError}
      onLoadStart={onLoadStart}
      onLoadEnd={onLoadEnd}
      onNavigationStateChange={onNavigationStateChange}
      onLogout={onLogout}
    />
  );
}