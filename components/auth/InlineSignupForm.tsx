import AccountSuccessAnimation from '@/components/AccountSuccessAnimation';
import { EnvironmentService } from '@/services/EnvironmentService';
import { Business } from '@/types/config';
import {
  checkIsEmpty,
  getErrorMessage,
  getInitValues,
  makeCustomFieldDataForApi
} from '@/utils/customFields';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Get environment-based URLs
const environmentService = EnvironmentService.getInstance();
const environmentConfig = environmentService.getConfig();
const appDomainName = environmentConfig.appDomainName;
const appDomainHost = environmentConfig.appDomainHost;
const base_url_api = environmentConfig.baseUrlApi;
const base_url_app = environmentConfig.baseUrlApp;

const urls = {
  appDomainName,
  appDomainHost,
  fetchCustomFields: '/customfields.json?page_location=signup',
  registerUser: base_url_app + 'v2/apiv2/nonsession.json?method=signupCustomer',
  businessApp: base_url_app + 'v1/businesses/',
  sendOTP: base_url_app + 'v2/apiv2/nonsession.json?method=sendOTP'
};

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

interface InlineSignupFormProps {
  initialEmail?: string;
  business: Business | null;
  onSignupSuccess: (userData: FormValues) => void;
  onBackToLogin: () => void;
  onNavigateToPassword: (userData: FormValues) => void;
  isLoading?: boolean;
}

const InlineSignupForm: React.FC<InlineSignupFormProps> = ({
  initialEmail = '',
  business,
  onSignupSuccess,
  onBackToLogin,
  onNavigateToPassword,
  isLoading = false,
}) => {
  const router = useRouter();
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: initialEmail,
    phoneNumber: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'details' | 'customFields' | 'password' | 'otp'>('details');
  const [allowOnlyOTPLogin, setAllowOTPLogin] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  
  // Custom fields state
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [customFieldValues, setCustomFieldValues] = useState<any[]>([]);
  
    // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCustomFieldIndex, setSelectedCustomFieldIndex] = useState<number | null>(null);
  const [currentDateValue, setCurrentDateValue] = useState<Date>(new Date());
  
  // Success animation state
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.firstName.trim()) {
      newErrors.firstName = 'Please enter your first name';
    }

    if (!formValues.lastName.trim()) {
      newErrors.lastName = 'Please enter your last name';
    } else if (formValues.lastName.length < 3) {
      newErrors.lastName = 'Last name should contain minimum 3 characters';
    }

    if (!formValues.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formValues.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Please enter your phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (): boolean => {
    if (step === 'password') {
      if (!password || password.length < 8) {
        Alert.alert('Validation Error', 'Password must be at least 8 characters long');
        return false;
      }
      if (password !== confirmPassword) {
        Alert.alert('Validation Error', 'Passwords do not match');
        return false;
      }
    }
    if (step === 'otp' && !otp) {
      Alert.alert('Validation Error', 'Please enter the OTP');
      return false;
    }
    return true;
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

  // API function to register user
  const registerUserAPI = async (userData: any): Promise<any> => {
    try {
      console.log('Registering user with data:', userData);
      
      const response = await fetch(urls.registerUser, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Service-Store-App/1.0',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Register user error:', error);
      throw error;
    }
  };

  // API function to send OTP
  const sendOTPAPI = async (email: string, businessId: string): Promise<any> => {
    try {
      const data = {
        email: email,
        business_id: businessId,
      };
      
      console.log('Sending OTP for:', data);
      
      const response = await fetch(urls.sendOTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Service-Store-App/1.0',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Send OTP error:', error);
      throw error;
    }
  };

  const handleSignup = async () => {
    if (step === 'details') {
      // Validate form details first
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
      });

      if (!validateForm()) {
        return;
      }

      if (!business) {
        Alert.alert('Error', 'Business information not available. Please try again.');
        return;
      }

      // Check if there are custom fields to show
      try {
        setLoading(true);
        await fetchCustomFields();
      } catch (error) {
        console.error('Error fetching custom fields:', error);
        // If error fetching custom fields, proceed to password step
        setStep('password');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (step === 'customFields') {
      // Validate custom fields
      if (!validateCustomFields()) {
        return;
      }
      
      // Move to password step
      setStep('password');
      return;
    }

    if (step === 'password') {
      if (!validatePasswordForm()) {
        return;
      }

      // Proceed with registration
      await handlePasswordSubmit();
      return;
    }

    if (step === 'otp') {
      if (!validatePasswordForm()) {
        return;
      }

      // Handle OTP verification and registration
      await handleOTPSubmit();
      return;
    }
  };

  const handlePasswordSubmit = async () => {
    if (!business) return;

    try {
      setLoading(true);

      // Prepare user data for registration
      const userData = {
        email: formValues.email,
        firstname: formValues.firstName,
        lastname: formValues.lastName,
        phonenumber: formValues.phoneNumber,
        custom_fields: makeCustomFieldDataForApi(customFields, customFieldValues),
        sendEmail: 0,
        business_id: business.businessId || business.id,
        password: password,
        cnfPassword: confirmPassword,
      };

      console.log('Registering user with data:', userData);

      // Register the user
      const registerResponse = await registerUserAPI(userData);
      console.log('Register response:', registerResponse);

      if (registerResponse.error) {
        Alert.alert('Error', registerResponse.message || 'Registration failed. Please try again.');
        return;
      }

      if (registerResponse.success) {
        setShowSuccessAnimation(true);
      }

    } catch (error) {
      console.error('Password submit error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async () => {
    if (!business) return;

    try {
      setLoading(true);
      
      // Prepare user data for OTP registration
      const userData = {
        email: formValues.email,
        firstname: formValues.firstName,
        lastname: formValues.lastName,
        phonenumber: formValues.phoneNumber,
        custom_fields: {},
        sendEmail: 0,
        business_id: business.businessId || business.id,
        otp: otp,
      };

      // Register the user with OTP
      const registerResponse = await registerUserAPI(userData);
      console.log('OTP Register response:', registerResponse);

      if (registerResponse.error) {
        Alert.alert('Error', registerResponse.message || 'Registration failed. Please try again.');
        return;
      }

      if (registerResponse.success) {
        setShowSuccessAnimation(true);
      }

    } catch (error) {
      console.error('OTP submit error:', error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch custom fields from API
  const fetchCustomFields = async () => {
    if (!business) return;

    try {
      const apiUrl = `${urls.businessApp}${business.businessId || business.id}${urls.fetchCustomFields}`;
      console.log('Fetching custom fields from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Service-Store-App/1.0',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Custom fields response:', result);

      if (result.error) {
        console.log('Custom fields error:', result);
        // No custom fields, proceed to password step
        setStep('password');
        return;
      }

      if (result?.data && result.data.length > 0) {
        setCustomFields(result.data);
        setCustomFieldValues(getInitValues(result.data));
        setStep('customFields');
      } else {
        // No custom fields, proceed to password step
        setStep('password');
      }
    } catch (error) {
      console.error('Fetch custom fields error:', error);
      // If error, proceed to password step
      setStep('password');
    }
  };

  // Validate custom fields
  const validateCustomFields = (): boolean => {
    if (customFields.length === 0) return true;

    let isValid = true;
    const updatedFormValues = [...customFieldValues];

    customFields.forEach((field, index) => {
      if (field.label_mandatory) {
        const isEmpty = checkIsEmpty(field.label_type, customFieldValues[index]?.value);
        if (isEmpty) {
          isValid = false;
          updatedFormValues[index] = {
            ...updatedFormValues[index],
            error: getErrorMessage(field),
          };
        } else {
          updatedFormValues[index] = {
            ...updatedFormValues[index],
            error: false,
          };
        }
      }
    });

    setCustomFieldValues(updatedFormValues);
    
    if (!isValid) {
      Alert.alert('Validation Error', 'Please fill all required fields');
    }

    return isValid;
  };

  // Handle custom field change
  const handleCustomFieldChange = (value: any, index: number) => {
    const updatedValues = [...customFieldValues];
    updatedValues[index] = {
      ...updatedValues[index],
      value: value,
      error: false,
    };
    setCustomFieldValues(updatedValues);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if invalid date
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original string if error
    }
  };

  // Handle date picker
  const handleDatePicker = (index: number) => {
    setSelectedCustomFieldIndex(index);
    // Set current date value from existing field value or reasonable default
    const existingValue = customFieldValues[index]?.value;
    if (existingValue && existingValue !== '') {
      setCurrentDateValue(new Date(existingValue));
    } else {
      // Set a reasonable default date for birth date (25 years ago)
      const defaultDate = new Date();
      defaultDate.setFullYear(defaultDate.getFullYear() - 25);
      setCurrentDateValue(defaultDate);
    }
    setShowDatePicker(true);
  };

  // Handle date change from picker (now only updates the current value, doesn't save)
  const onDateChange = (event: any, selectedDate?: Date) => {
    console.log('Date changed:', { event: event?.type, selectedDate });
    
    // Just update the current value, don't close the modal yet
    if (selectedDate) {
      setCurrentDateValue(selectedDate);
    }
  };



  // Handle success animation completion
  const handleSuccessAnimationComplete = () => {
    setShowSuccessAnimation(false);
    onSignupSuccess(formValues);
  };

  // Handle select picker
  const handleSelectPicker = (field: any, index: number) => {
    if (!field.label_options || field.label_options.length === 0) {
      Alert.alert('No Options', 'No options available for this field');
      return;
    }

    const options = field.label_options.split(',').map((opt: string) => opt.trim());
    const buttons = options.map((option: string) => ({
      text: option,
      onPress: () => handleCustomFieldChange(option, index)
    }));
    
    buttons.push({ text: 'Cancel', onPress: () => {} });

    Alert.alert('Select Option', 'Choose an option:', buttons);
  };

  // Handle multi-select picker
  const handleMultiSelectPicker = (field: any, index: number) => {
    if (!field.label_options || field.label_options.length === 0) {
      Alert.alert('No Options', 'No options available for this field');
      return;
    }

    // For now, show a simple implementation
    // In a production app, you'd create a proper multi-select modal
    const currentValue = customFieldValues[index]?.value || [];
    const options = field.label_options.split(',').map((opt: string) => opt.trim());
    
    Alert.alert(
      'Multi Select',
      `Currently selected: ${currentValue.length} items\n\nThis is a simplified implementation. In a full app, this would show a proper multi-select interface.`,
      [
        { text: 'Clear All', onPress: () => handleCustomFieldChange([], index) },
        { text: 'OK', onPress: () => {} }
      ]
    );
  };

  const handleBackStep = () => {
    if (step === 'password' || step === 'otp') {
      if (customFields.length > 0) {
        setStep('customFields');
      } else {
        setStep('details');
      }
    } else if (step === 'customFields') {
      setStep('details');
    } else {
      onBackToLogin();
    }
  };

  // Render individual custom field component
  const renderCustomField = (field: any, index: number) => {
    const fieldValue = customFieldValues[index];
    const hasError = fieldValue?.error;

    switch (field.label_type) {
      case 'text':
        return (
          <View key={index} style={styles.inputContainer}>
            <TextInput
              placeholder={field.label_name}
              placeholderTextColor="#999"
              onChangeText={(value) => handleCustomFieldChange(value, index)}
              value={fieldValue?.value || ''}
              style={[styles.input, hasError && styles.inputError]}
              returnKeyType="next"
            />
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      case 'number':
        return (
          <View key={index} style={styles.inputContainer}>
            <TextInput
              placeholder={field.label_name}
              placeholderTextColor="#999"
              onChangeText={(value) => handleCustomFieldChange(value, index)}
              value={fieldValue?.value || ''}
              style={[styles.input, hasError && styles.inputError]}
              keyboardType="number-pad"
              returnKeyType="next"
            />
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      case 'checkbox':
        return (
          <View key={index} style={styles.inputContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleCustomFieldChange(!fieldValue?.value, index)}
            >
              <View style={[styles.checkbox, fieldValue?.value && styles.checkboxChecked]}>
                {fieldValue?.value && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                {field.label_name}
              </Text>
            </TouchableOpacity>
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      case 'date':
        return (
          <View key={index} style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.dateButton, hasError && styles.inputError]}
              onPress={() => handleDatePicker(index)}
            >
              <Text style={[styles.dateButtonText, !fieldValue?.value && styles.placeholderText]}>
                {fieldValue?.value ? formatDate(fieldValue.value) : `Select ${field.label_name}`}
              </Text>
            </TouchableOpacity>
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      case 'select':
        return (
          <View key={index} style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.selectButton, hasError && styles.inputError]}
              onPress={() => handleSelectPicker(field, index)}
            >
              <Text style={[styles.selectButtonText, !fieldValue?.value && styles.placeholderText]}>
                {fieldValue?.value || field.label_name}
              </Text>
            </TouchableOpacity>
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      case 'multiselect':
        const selectedValues = fieldValue?.value || [];
        return (
          <View key={index} style={styles.inputContainer}>
            <TouchableOpacity
              style={[styles.selectButton, hasError && styles.inputError]}
              onPress={() => handleMultiSelectPicker(field, index)}
            >
              <Text style={[styles.selectButtonText, selectedValues.length === 0 && styles.placeholderText]}>
                {selectedValues.length > 0 
                  ? `${selectedValues.length} item(s) selected`
                  : field.label_name}
              </Text>
            </TouchableOpacity>
            {hasError && (
              <Text style={styles.errorText}>{fieldValue.error}</Text>
            )}
          </View>
        );

      default:
        return (
          <View key={index} style={styles.inputContainer}>
            <Text style={styles.unsupportedText}>
              {field.label_name} ({field.label_type} - not supported yet)
            </Text>
          </View>
        );
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 'details':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="First Name"
                placeholderTextColor="#999"
                onChangeText={(value) => handleInputChange('firstName', value)}
                onBlur={() => handleInputBlur('firstName')}
                value={formValues.firstName}
                style={[
                  styles.input,
                  touched.firstName && errors.firstName && styles.inputError
                ]}
                returnKeyType="next"
                autoCapitalize="words"
              />
              {touched.firstName && errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Last Name"
                placeholderTextColor="#999"
                onChangeText={(value) => handleInputChange('lastName', value)}
                onBlur={() => handleInputBlur('lastName')}
                value={formValues.lastName}
                style={[
                  styles.input,
                  touched.lastName && errors.lastName && styles.inputError
                ]}
                returnKeyType="next"
                autoCapitalize="words"
              />
              {touched.lastName && errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#999"
                onChangeText={(value) => handleInputChange('email', value)}
                onBlur={() => handleInputBlur('email')}
                value={formValues.email}
                style={[
                  styles.input,
                  touched.email && errors.email && styles.inputError
                ]}
                returnKeyType="next"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {touched.email && errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#999"
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                onBlur={() => handleInputBlur('phoneNumber')}
                value={formValues.phoneNumber}
                style={[
                  styles.input,
                  touched.phoneNumber && errors.phoneNumber && styles.inputError
                ]}
                returnKeyType="done"
                keyboardType="phone-pad"
              />
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>
          </View>
        );

      case 'customFields':
        return (
          <View style={styles.formContainer}>
            {customFields.map((field, index) => renderCustomField(field, index))}
          </View>
        );

      case 'password':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                onChangeText={setPassword}
                value={password}
                style={styles.input}
                secureTextEntry
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#999"
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                style={styles.input}
                secureTextEntry
                returnKeyType="done"
              />
            </View>
          </View>
        );

      case 'otp':
        return (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter OTP sent to your email"
                placeholderTextColor="#999"
                onChangeText={setOtp}
                value={otp}
                style={styles.input}
                keyboardType="number-pad"
                returnKeyType="done"
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {renderStepContent()}
      
      <TouchableOpacity
        style={[
          styles.continueButton,
          (isLoading || loading) && styles.continueButtonDisabled
        ]}
        onPress={handleSignup}
        disabled={isLoading || loading}
      >
        <Text style={styles.continueButtonText}>
          {(isLoading || loading) ? 'Processing...' : 
           step === 'details' ? 'Continue' :
           step === 'customFields' ? 'Continue' :
           step === 'password' ? 'Create Account' : 'Verify & Complete'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.backToLoginButton}
        onPress={onBackToLogin}
      >
        <Text style={styles.backToLoginText}>
          Already have an account? <Text style={styles.backToLoginLink}>Sign in</Text>
        </Text>
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                onPress={() => setShowDatePicker(false)}
                style={styles.modalButton}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity 
                onPress={() => {
                  if (selectedCustomFieldIndex !== null) {
                    const dateString = currentDateValue.toISOString().split('T')[0];
                    handleCustomFieldChange(dateString, selectedCustomFieldIndex);
                    console.log('Date confirmed and saved:', dateString);
                  }
                  setShowDatePicker(false);
                  setSelectedCustomFieldIndex(null);
                }}
                style={styles.modalButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <DateTimePicker
              value={currentDateValue}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setCurrentDateValue(selectedDate);
                }
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
              style={styles.datePicker}
            />
          </View>
        </View>
      </Modal>
      
      <AccountSuccessAnimation
        visible={showSuccessAnimation}
        onComplete={handleSuccessAnimationComplete}
        title="Account Created!"
        subtitle="Welcome to Sogility! Your account has been created successfully."
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 34,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  continueButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  continueButtonDisabled: {
    backgroundColor: '#999',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  backToLoginText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  backToLoginLink: {
    color: '#007AFF',
    fontWeight: '600',
  },
  unsupportedText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    flex: 1,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 15,
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexDirection: 'row',
    position: 'relative',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'flex-start',
    minHeight: 52,
    justifyContent: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  placeholderText: {
    color: '#999',
  },
  datePickerModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  datePickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  datePickerCancelButton: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  datePickerDoneButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  datePicker: {
    backgroundColor: '#fff',
    height: 200,
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default InlineSignupForm;