import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import AuthWrapper from '../../../components/auth/AuthWrapper';
import { StorageService } from '../../../services/StorageService';

interface FormValues {
  password: string;
  confirmPassword: string;
  otp: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  otp?: string;
}

const SetPassword: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setLoading] = useState(false);
  const [isOTPLogin, setIsOTPLogin] = useState(false);
  
  const [formValues, setFormValues] = useState<FormValues>({
    password: '',
    confirmPassword: '',
    otp: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    // Parse user details from params
    if (params.userDetails) {
      try {
        const details = JSON.parse(params.userDetails as string);
        setUserDetails(details);
      } catch (error) {
        console.error('Error parsing user details:', error);
      }
    }

    // For now, we'll default to password mode
    // In a real implementation, this would check business settings
    setIsOTPLogin(false);
  }, [params]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (isOTPLogin) {
      if (!formValues.otp.trim()) {
        newErrors.otp = 'Please enter OTP';
      }
    } else {
      if (!formValues.password.trim()) {
        newErrors.password = 'Please enter a password';
      } else if (formValues.password.length < 8) {
        newErrors.password = 'Password must be minimum 8 characters long';
      }

      if (!formValues.confirmPassword.trim()) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formValues.password !== formValues.confirmPassword) {
        newErrors.confirmPassword = 'Passwords must match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInputBlur = (field: keyof FormValues) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const registerUser = async () => {
    if (!userDetails) {
      Alert.alert('Error', 'User details not found. Please go back and try again.');
      return;
    }

    try {
      setLoading(true);

      // Get business details from storage
      const selectedBusinessId = await StorageService.getSelectedBusinessId();
      if (!selectedBusinessId) {
        Alert.alert('Error', 'Business not selected. Please restart the app.');
        return;
      }

      // Prepare registration data
      const registrationData = {
        email: userDetails.email,
        firstname: userDetails.firstName,
        lastname: userDetails.lastName,
        phonenumber: userDetails.phoneNumber,
        business_id: selectedBusinessId,
        custom_fields: {},
        sendEmail: 0,
      };

      if (isOTPLogin) {
        (registrationData as any).otp = formValues.otp;
      } else {
        (registrationData as any).password = formValues.password;
        (registrationData as any).cnfPassword = formValues.confirmPassword;
      }

      console.log('Registration data:', registrationData);

      // Here you would make the actual API call to register the user
      // For now, we'll simulate success and proceed to login
      
      Alert.alert(
        'Success',
        'Account created successfully! You will be logged in automatically.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to main app or trigger login
              router.replace('../login');
            }
          }
        ]
      );

    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Mark all relevant fields as touched
    if (isOTPLogin) {
      setTouched({ otp: true });
    } else {
      setTouched({
        password: true,
        confirmPassword: true,
      });
    }

    if (!validateForm()) {
      return;
    }

    await registerUser();
  };

  return (
    <AuthWrapper 
      title="Create Account" 
      pageNumber={2}
      userDetails={userDetails}
    >
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            {isOTPLogin ? (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>OTP*</Text>
                <TextInput
                  placeholder="Enter OTP"
                  placeholderTextColor="#999999"
                  onChangeText={(value) => handleInputChange('otp', value)}
                  onBlur={() => handleInputBlur('otp')}
                  value={formValues.otp}
                  style={[
                    styles.input,
                    touched.otp && errors.otp && styles.inputError
                  ]}
                  returnKeyType="done"
                  keyboardType="number-pad"
                />
                {touched.otp && errors.otp && (
                  <Text style={styles.errorText}>{errors.otp}</Text>
                )}
              </View>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Password*</Text>
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="#999999"
                    onChangeText={(value) => handleInputChange('password', value)}
                    onBlur={() => handleInputBlur('password')}
                    value={formValues.password}
                    style={[
                      styles.input,
                      touched.password && errors.password && styles.inputError
                    ]}
                    returnKeyType="next"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Confirm Password*</Text>
                  <TextInput
                    placeholder="Re-enter your password"
                    placeholderTextColor="#999999"
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    onBlur={() => handleInputBlur('confirmPassword')}
                    value={formValues.confirmPassword}
                    style={[
                      styles.input,
                      touched.confirmPassword && errors.confirmPassword && styles.inputError
                    ]}
                    returnKeyType="done"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>
              </>
            )}

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                {userDetails && (
                  <>
                    Creating account for: {userDetails.firstName} {userDetails.lastName}
                    {'\n'}Email: {userDetails.email}
                    {'\n'}Phone: {userDetails.phoneNumber}
                  </>
                )}
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isLoading && styles.continueButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
    paddingBottom: 100, // Space for button
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    height: 50,
    color: '#333333',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  infoContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SetPassword;