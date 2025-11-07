import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

const Signup: React.FC = () => {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

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

  const handleSignup = async () => {
    // Mark all fields as touched
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      console.log('Signup data:', formValues);
      
      // Navigate to set password screen with user details
      router.push({
        pathname: './setPassword',
        params: { 
          userDetails: JSON.stringify(formValues)
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthWrapper title="Create Account" pageNumber={1}>
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
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name*</Text>
              <TextInput
                placeholder="Enter your first name"
                placeholderTextColor="#999999"
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
              <Text style={styles.inputLabel}>Last Name*</Text>
              <TextInput
                placeholder="Enter your last name"
                placeholderTextColor="#999999"
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
              <Text style={styles.inputLabel}>Email Address*</Text>
              <TextInput
                placeholder="Enter your email"
                placeholderTextColor="#999999"
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
              <Text style={styles.inputLabel}>Phone Number*</Text>
              <TextInput
                placeholder="Enter your phone number"
                placeholderTextColor="#999999"
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
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              isLoading && styles.continueButtonDisabled
            ]}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.continueButtonText}>
              {isLoading ? 'Loading...' : 'Continue'}
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

export default Signup;