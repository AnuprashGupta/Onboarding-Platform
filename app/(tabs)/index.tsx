import { CalendarPicker } from '@/components/onboarding/CalendarPicker';
import { CounterTimer } from '@/components/onboarding/CounterTimer';
import { FilePicker, SelectedFile } from '@/components/onboarding/FilePicker';
import { CustomTextInput } from '@/components/onboarding/TextInput';
import { OnboardingService } from '@/services/onboarding.service';
import { OnboardingSubmitRequest } from '@/types/onboarding';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [startDate, setStartDate] = useState('');
  const [documents, setDocuments] = useState<SelectedFile[]>([]);

  // Validation state
  const [isNameValid, setIsNameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

  // Check if form is valid
  const isFormValid = () => {
    return (
      name.trim().length > 0 &&
      email.trim().length > 0 &&
      isEmailValid &&
      startDate.trim().length > 0 &&
      documents.length > 0
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all fields
    const validation = OnboardingService.validateOnboardingData({
      name,
      email,
      startDate,
      documents,
    });

    if (!validation.valid) {
      Alert.alert('Validation Error', validation.errors.join('\n'));
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: OnboardingSubmitRequest = {
        name,
        email,
        startDate,
        documents,
      };

      // Using real Cloudflare Workers backend
      const response = await OnboardingService.submitOnboarding(payload);

      if (response.success) {
        setSubmittedData(response.data);
        setShowSuccess(true);
        Alert.alert('Success', response.message || 'Onboarding submitted successfully!');
      } else {
        Alert.alert('Error', response.error || 'Failed to submit onboarding');
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset z
  const handleReset = () => {
    setName('');
    setEmail('');
    setStartDate('');
    setDocuments([]);
    setIsNameValid(false);
    setIsEmailValid(false);
    setShowSuccess(false);
    setSubmittedData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Onboarding Platform</Text>
            <Text style={styles.subtitle}>
              Complete the form below to begin your journey
            </Text>
          </View>

          {/* Counter Timer Demo */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Counter Timer Demo</Text>
            <CounterTimer
              targetNumber={100}
              durationSec={10}
              onComplete={() => console.log('Counter completed!')}
              easing="easeInOut"
            />
          </View>

          {/* Onboarding Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Information</Text>

            <CustomTextInput
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              onValidate={setIsNameValid}
              validators={[
                { type: 'required', message: 'Name is required' },
                { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' },
                { type: 'maxLength', value: 100, message: 'Name must not exceed 100 characters' },
              ]}
              keyboardType="default"
              autoCapitalize="words"
            />

            <CustomTextInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              onValidate={setIsEmailValid}
              validators={[
                { type: 'required', message: 'Email is required' },
                { type: 'email', message: 'Invalid email format' },
              ]}
              keyboardType="email-address"
              autoCapitalize="none"
              helperText="We'll use this for communication"
            />

            <CalendarPicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              format="DD/MM/YYYY"
              minDate={new Date()}
              maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
              placeholder="Select your start date"
              required
            />

            <FilePicker
              label="Documents"
              value={documents}
              onChange={setDocuments}
              maxFiles={3}
              maxSizePerFile={5 * 1024 * 1024} // 5MB
              maxTotalSize={15 * 1024 * 1024} // 15MB
              allowedTypes={['*/*']}
              required
              helperText="Upload your ID, photo, or other documents (e.g., avatar + ID)"
            />
          </View>

          {/* Success Message */}
          {showSuccess && submittedData && (
            <View style={styles.successSection}>
              <Text style={styles.successTitle}>✓ Submission Successful!</Text>
              <View style={styles.successCard}>
                <Text style={styles.successLabel}>Submission ID</Text>
                <Text style={styles.successValue}>{submittedData.id}</Text>

                <Text style={styles.successLabel}>Name</Text>
                <Text style={styles.successValue}>{submittedData.name}</Text>

                <Text style={styles.successLabel}>Email</Text>
                <Text style={styles.successValue}>{submittedData.email}</Text>

                <Text style={styles.successLabel}>Start Date</Text>
                <Text style={styles.successValue}>{submittedData.startDate}</Text>

                <Text style={styles.successLabel}>Documents Uploaded</Text>
                {submittedData.documents.map((doc: any, index: number) => (
                  <Text key={index} style={styles.successDocument}>
                    • {doc.name} ({(doc.size / 1024).toFixed(2)} KB)
                  </Text>
                ))}

                <Text style={styles.successLabel}>Submitted At</Text>
                <Text style={styles.successValue}>
                  {new Date(submittedData.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isFormValid() || isSubmitting) && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              accessibilityLabel="Submit onboarding form"
              accessibilityRole="button"
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Onboarding</Text>
              )}
            </TouchableOpacity>

            {showSuccess && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleReset}
                accessibilityLabel="Reset form"
                accessibilityRole="button"
              >
                <Text style={styles.resetButtonText}>Start New Submission</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Built with React Native • Expo • TypeScript
            </Text>
            <Text style={styles.footerText}>
              Version 1.0.0 • {new Date().getFullYear()}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#2196F3',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  successSection: {
    marginVertical: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 16,
    textAlign: 'center',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  successLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    marginTop: 12,
    marginBottom: 4,
  },
  successValue: {
    fontSize: 16,
    color: '#212121',
  },
  successDocument: {
    fontSize: 14,
    color: '#212121',
    marginLeft: 8,
    marginTop: 2,
  },
  actions: {
    marginTop: 16,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  resetButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginVertical: 2,
  },
});
