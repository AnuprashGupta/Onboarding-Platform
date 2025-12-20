import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
  TextInputProps as RNTextInputProps,
} from 'react-native';

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'regex' | 'email' | 'custom';
  value?: any;
  message: string;
  validator?: (value: string) => boolean;
}

export interface CustomTextInputProps extends Omit<RNTextInputProps, 'onChangeText'> {
  label: string;
  placeholder?: string;
  helperText?: string;
  validators?: ValidationRule[];
  disabled?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  onValidate?: (isValid: boolean) => void;
}

export const CustomTextInput: React.FC<CustomTextInputProps> = ({
  label,
  placeholder,
  helperText,
  validators = [],
  disabled = false,
  value: externalValue,
  onChangeText: externalOnChangeText,
  onValidate,
  keyboardType = 'default',
  ...restProps
}) => {
  const [internalValue, setInternalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Support both controlled and uncontrolled mode
  const value = externalValue !== undefined ? externalValue : internalValue;
  const isControlled = externalValue !== undefined;

  const validate = useCallback((text: string): string[] => {
    const validationErrors: string[] = [];

    validators.forEach((rule) => {
      switch (rule.type) {
        case 'required':
          if (!text.trim()) {
            validationErrors.push(rule.message);
          }
          break;

        case 'minLength':
          if (text.length < rule.value) {
            validationErrors.push(rule.message);
          }
          break;

        case 'maxLength':
          if (text.length > rule.value) {
            validationErrors.push(rule.message);
          }
          break;

        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (text && !emailRegex.test(text)) {
            validationErrors.push(rule.message);
          }
          break;

        case 'regex':
          if (rule.value && text && !rule.value.test(text)) {
            validationErrors.push(rule.message);
          }
          break;

        case 'custom':
          if (rule.validator && !rule.validator(text)) {
            validationErrors.push(rule.message);
          }
          break;
      }
    });

    return validationErrors;
  }, [validators]);

  const handleChangeText = useCallback((text: string) => {
    if (!isControlled) {
      setInternalValue(text);
    }
    externalOnChangeText?.(text);

    // Validate on change if already touched
    if (isTouched) {
      const validationErrors = validate(text);
      setErrors(validationErrors);
      onValidate?.(validationErrors.length === 0);
    }
  }, [isControlled, isTouched, validate, externalOnChangeText, onValidate]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsTouched(true);

    // Validate on blur
    const validationErrors = validate(value);
    setErrors(validationErrors);
    onValidate?.(validationErrors.length === 0);
  }, [value, validate, onValidate]);

  const hasError = isTouched && errors.length > 0;
  const isSuccess = isTouched && errors.length === 0 && value.trim().length > 0;

  const getBorderColor = () => {
    if (disabled) return '#E0E0E0';
    if (hasError) return '#F44336';
    if (isSuccess) return '#4CAF50';
    if (isFocused) return '#2196F3';
    return '#BDBDBD';
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
        {validators.some(v => v.type === 'required') && (
          <Text style={styles.required}> *</Text>
        )}
      </Text>

      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          disabled && styles.disabledContainer,
        ]}
      >
        <RNTextInput
          style={[styles.input, disabled && styles.disabledText]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#9E9E9E"
          editable={!disabled}
          keyboardType={keyboardType}
          accessibilityLabel={label}
          accessibilityHint={helperText}
          accessibilityState={{
            disabled,
            invalid: hasError,
          }}
          {...restProps}
        />

        {/* Status indicator */}
        {isSuccess && (
          <View style={styles.statusIndicator}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
        )}
        {hasError && (
          <View style={styles.statusIndicator}>
            <Text style={styles.errorIcon}>✕</Text>
          </View>
        )}
      </View>

      {/* Helper text or error messages */}
      {hasError ? (
        <View style={styles.messageContainer}>
          {errors.map((error, index) => (
            <Text key={index} style={styles.errorText} accessibilityLiveRegion="polite">
              {error}
            </Text>
          ))}
        </View>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* Character count for maxLength validation */}
      {validators.some(v => v.type === 'maxLength') && (
        <Text style={styles.characterCount}>
          {value.length} / {validators.find(v => v.type === 'maxLength')?.value}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48, // Accessibility touch target
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  disabledContainer: {
    backgroundColor: '#F5F5F5',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  statusIndicator: {
    paddingRight: 12,
  },
  successIcon: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: '700',
  },
  errorIcon: {
    color: '#F44336',
    fontSize: 18,
    fontWeight: '700',
  },
  messageContainer: {
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 2,
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'right',
    marginTop: 4,
  },
});






