import { ConfigService } from '@/services/ConfigService';
import { StorageService } from '@/services/StorageService';
import { Business } from '@/types/config';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import InlineSignupForm from '../../components/auth/InlineSignupForm';
import { useAuth } from './AuthContainer';

// URL Constants
const appDomainName = '.getomnify.com';
const appDomainHost = 'https://app.getomnify.com';
const base_url_api = 'https://api.getomnify.com/';
const base_url_app = 'https://app.getomnify.com/';

const urls = {
  appDomainName,
  appDomainHost,
  login: 'login',
  getInfoForLogin: base_url_app + 'v2/apiv2/nonsession.json?method=getInfoForLogin',
  sendOTPForLogin: base_url_app + 'v2/apiv2/nonsession.json?method=sendOTP',
  searchCustomer: base_url_api + 'v1/customers/search',
  checkOTP: 'login/checkOTP/',
  sendOTP: base_url_app + 'v2/apiv2/nonsession.json?method=sendOTP',
  verifyOTP: '/login/checkOTP/',
  sendForgotPasswordLink: base_url_app + 'v2/Apiv2/nonsession.json?method=sendResetPasswordMailToUser',
  business: base_url_api + 'v1/businesses/',
  businessApp: base_url_app + 'v1/businesses/',
  businessDetails: '/meta',
  sendDeviceToken: '/device-tokens/',
  fetchCustomFields: '/customfields.json?page_location=signup',
  registerUser: base_url_app + 'v2/apiv2/nonsession.json?method=signupCustomer'
};

export default function LoginScreen() {
  const router = useRouter();
  
  // Try to get auth context, but don't fail if it's not available (for standalone use)
  let authContext = null;
  try {
    authContext = useAuth();
  } catch (error) {
    // Not in auth context, will load business from storage
  }
  
  const [business, setBusiness] = useState<Business | null>(authContext?.business || null);
  const [isLoading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Checking');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [userID, setUserID] = useState('');
  
  const [isUser, setIsUser] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState('');
  const [userNotFound, setUserNotFound] = useState(false);
  const [otpSent, setOTPSent] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Load business data on component mount (only if not provided by context)
  useEffect(() => {
    if (!authContext?.business) {
      loadBusinessData();
    }
  }, []);

  const loadBusinessData = async () => {
    try {
      const selectedBusinessId = await StorageService.getSelectedBusinessId();
      if (!selectedBusinessId) {
        router.replace('/');
        return;
      }

      const configService = ConfigService.getInstance();
      const foundBusiness = await configService.findBusiness(selectedBusinessId);
      
      if (!foundBusiness) {
        router.replace('/');
        return;
      }
      
      setBusiness(foundBusiness);
    } catch (error) {
      console.error('Failed to load business data:', error);
      router.replace('/');
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!business) {
      setLoginErrorMessage('Business information not available. Please try again.');
      setLoginError(true);
      return;
    }

    if (!email || !validateEmail(email)) {
      setLoginErrorMessage('Please enter a valid email address');
      setLoginError(true);
      return;
    }

    if (isUser && !otpSent && !password) {
      setLoginErrorMessage('Password is required');
      setLoginError(true);
      return;
    }

    if (isUser && otpSent && !otp) {
      setLoginErrorMessage('OTP is required');
      setLoginError(true);
      return;
    }

    setLoginError(false);
    setUserNotFound(false);
    setShowSignup(false);

    if (isUser) {
      await fetchCsrfToken(password, otp, otpSent);
    } else {
      await preLoginCheck(email, business.businessId || business.id);
    }
  };

  const preLoginCheck = async (email: string, businessId: string) => {
    console.log('Pre-login check:', email, businessId);
    if (!email || !businessId || !business) {
      console.log('Email, business ID, or business is null');
      return;
    }

    setLoading(true);
    setLoadingText('Verifying user...');

    try {
      // Use the businessId from the business configuration
      const actualBusinessId = business.businessId || businessId;
      
      // Use the correct URL from the URLs constant
      const apiUrl = `${urls.getInfoForLogin}&email=${encodeURIComponent(email)}&business_id=${actualBusinessId}`;
      console.log('Pre-login check URL:', apiUrl);
      console.log('Using business ID from config:', actualBusinessId);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Service-Store-App/1.0',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseText = await response.text();
      console.log('Raw response:', responseText.substring(0, 200)); // Log first 200 chars
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log('JSON Parse error. Response was:', responseText);
        throw new Error('Invalid JSON response from server');
      }
      setLoading(false);

      console.log('Pre-login check response:', result);

      if (result.error) {
        console.log('Pre-login check error:', result);
        setLoginError(true);
        setLoginErrorMessage(result.message || 'Failed to verify user. Please try again.');
      } else {
        if (result?.is_user) {
          if (result?.is_customer) {
            setOTPSent(result?.otp_sent);
            setIsUser(true);
          } else {
            Alert.alert('Account Required', 'Please create an account to continue.');
          }
        } else {
          setShowSignup(true);
        }
      }
    } catch (error) {
      console.log('Pre-login check error:', error);
      setLoading(false);
      setLoginError(true);
      setLoginErrorMessage('Network error. Please check your connection and try again.');
    }
  };

  const fetchCsrfToken = async (password: string, otp: string, otpLogin: boolean) => {
    if (!business) return;
    
    setLoading(true);

    const baseUrl = business.storeUrl.replace(/\/home$/, '');
    const csrfUrl = `${baseUrl}/api/auth/csrf`;
    console.log('Fetching CSRF token from:', csrfUrl);
    
    try {
      const response = await fetch(csrfUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Referer': `${baseUrl}/home?b=t`,
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'sec-ch-ua': '"Service Store App";v="1.0"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Mobile"',
          'User-Agent': 'Service-Store-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`CSRF HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log('CSRF Response:', data);

      if (data?.csrfToken) {
        await fetchCookies(data.csrfToken, password, otp, otpLogin);
      } else {
        setLoginError(true);
        setLoginErrorMessage('Failed to get authentication token');
        setLoading(false);
      }
    } catch (error) {
      console.error('CSRF Error:', error);
      setLoading(false);
      setLoginError(true);
      setLoginErrorMessage('Authentication setup failed. Please try again.');
    }
  };

  const fetchCookies = async (csrf: string, password: string, otp: string, otpLogin: boolean) => {
    if (!business) return;
    
    setLoading(true);
    setLoadingText('Authenticating...');

    const baseUrl = business.storeUrl.replace(/\/home$/, '');
    const authUrl = `${baseUrl}/api/auth/callback/credentials`;
    console.log('Authentication URL:', authUrl);

    try {
      const requestBody = new URLSearchParams({
        redirect: 'false',
        email: email,
        password: otpSent ? otp : password,
        type: otpSent ? 'otp' : 'email',
        csrfToken: csrf,
        callbackUrl: `${baseUrl}/home?b=t`,
        json: 'true',
      });

      console.log('Authentication request body:', requestBody.toString());

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'User-Agent': 'Service-Store-App/1.0',
          'Referer': baseUrl,
        },
        body: requestBody.toString(),
      });

      console.log('Authentication response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Authentication error response:', errorText);
        throw new Error(`Authentication failed: ${response.status}`);
      }

      // Get cookies from response
      const setCookieHeader = response.headers.get('Set-Cookie');
      console.log('Set-Cookie header:', setCookieHeader);
      
      const responseData = await response.json();
      console.log('Authentication response data:', responseData);

      // Check if authentication was successful
      if (setCookieHeader && (responseData?.url || responseData?.ok !== false)) {
        // Look for session token in cookies to verify successful authentication
        const hasSessionToken = setCookieHeader?.includes('next-auth.session-token') || 
                               setCookieHeader?.includes('authautologin') ||
                               setCookieHeader?.includes('omnify-multi-token');
        
        if (hasSessionToken) {
          setLoading(true);
          setLoadingText('Logging in...');
          
          // Store auth data
          const authData = {
            email: email,
            storeURL: business.storeUrl,
            cookies: setCookieHeader,
            business: business,
            token: 'auth-token', // You might extract actual token from cookies
          };

          // Save to storage
          await StorageService.saveAuthData(authData);
          
          setTimeout(() => {
            setLoading(false);
            // Use context callback if available, otherwise navigate
            if (authContext?.onAuthSuccess) {
              authContext.onAuthSuccess(authData);
            } else {
              router.replace('/');
            }
          }, 1000);
        } else {
          setLoginError(true);
          setLoginErrorMessage(otpSent ? 'Invalid OTP' : 'Invalid email or password');
          setLoading(false);
        }
      } else {
        setLoginError(true);
        setLoginErrorMessage(responseData?.error || (otpSent ? 'Invalid OTP' : 'Invalid email or password'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError(true);
      setLoginErrorMessage('Login failed. Please check your credentials and try again.');
      setLoading(false);
    }
  };

  const onBackPress = () => {
    if (showSignup) {
      setShowSignup(false);
      setLoginError(false);
      setLoginErrorMessage('');
    }
  };

  const handleSignupSuccess = (userData: any) => {
    // Registration successful - handle login or navigation
    setLoading(true);
    setLoadingText('Signing in...');
    
    // For now, we'll just reset to login state
    // In a production app, you might want to automatically log the user in
    setTimeout(() => {
      setShowSignup(false);
      setLoading(false);
      Alert.alert('Account Created', 'Your account has been created successfully. Please sign in with your credentials.');
    }, 1500);
  };

  const handleNavigateToPassword = (userData: any) => {
    // For now, since we don't have the setPassword screen in this architecture,
    // we'll implement a simple inline registration process in the signup form
    console.log('Navigate to password setup for:', userData);
    
    // The InlineSignupForm will handle the complete registration internally
    // This is just a placeholder for potential future navigation
  };

  const handleBackToLogin = () => {
    setShowSignup(false);
    setLoginError(false);
    setLoginErrorMessage('');
  };

  if (!business) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        {showSignup && (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>
          {showSignup ? `Sign Up for ${business.displayName}` : `Sign In to ${business.displayName}`}
        </Text>
        <Text style={styles.subtitle}>
          {showSignup ? 'Create your account to continue' : 'Access your account to continue'}
        </Text>
      </View>

      {showSignup ? (
        <InlineSignupForm
          initialEmail={email}
          business={business}
          onSignupSuccess={handleSignupSuccess}
          onBackToLogin={handleBackToLogin}
          onNavigateToPassword={handleNavigateToPassword}
          isLoading={isLoading}
        />
      ) : (
        <ScrollView style={styles.formContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          placeholder="johndoe@acme.com"
          placeholderTextColor="#999"
          onChangeText={setEmail}
          value={email}
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {isUser && otpSent ? (
          <>
            <Text style={styles.inputLabel}>One-Time Password</Text>
            <TextInput
              placeholder="Enter OTP"
              placeholderTextColor="#999"
              onChangeText={setOtp}
              value={otp}
              style={styles.input}
              keyboardType="number-pad"
              returnKeyType="done"
            />
          </>
        ) : (
          isUser && (
            <>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#999"
                onChangeText={setPassword}
                value={password}
                style={styles.input}
                secureTextEntry
                returnKeyType="done"
              />
            </>
          )
        )}

        {loginError && (
          <Text style={styles.error}>
            {loginErrorMessage || (otpSent
              ? 'Invalid OTP. Please try again.'
              : 'Invalid email or password.')}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? loadingText : 'Continue'}
          </Text>
        </TouchableOpacity>

        {isUser && !otpSent && (
          <TouchableOpacity style={styles.forgotPasswordButton}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.signupButton}
          onPress={() => setShowSignup(true)}
        >
          <Text style={styles.signupText}>
            Don't have an account? <Text style={styles.signupLink}>Sign up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
    marginLeft: -10,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 24,
    color: '#007AFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  error: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 20,
  },
  forgotPasswordText: {
    color: '#007AFF',
    fontSize: 16,
  },
  signupButton: {
    alignItems: 'center',
    marginTop: 30,
    paddingVertical: 15,
  },
  signupText: {
    fontSize: 16,
    color: '#666',
  },
  signupLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
});