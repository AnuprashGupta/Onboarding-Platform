import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

export interface CalendarPickerProps {
  label: string;
  value?: string;
  onChange?: (date: string) => void;
  format?: DateFormat;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  label,
  value = '',
  onChange,
  format = 'DD/MM/YYYY',
  minDate,
  maxDate,
  placeholder = 'Select a date',
  disabled = false,
  required = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [textValue, setTextValue] = useState(value);
  const [error, setError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // Format date to string based on format prop
  const formatDate = useCallback((date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'MM/DD/YYYY':
        return `${month}/${day}/${year}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }, [format]);

  // Parse string to date based on format
  const parseDate = useCallback((dateString: string): Date | null => {
    if (!dateString.trim()) return null;

    let day: number, month: number, year: number;

    try {
      if (format === 'DD/MM/YYYY') {
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else if (format === 'MM/DD/YYYY') {
        const parts = dateString.split('/');
        if (parts.length !== 3) return null;
        month = parseInt(parts[0], 10) - 1;
        day = parseInt(parts[1], 10);
        year = parseInt(parts[2], 10);
      } else if (format === 'YYYY-MM-DD') {
        const parts = dateString.split('-');
        if (parts.length !== 3) return null;
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      } else {
        return null;
      }

      const date = new Date(year, month, day);
      
      // Validate date
      if (
        isNaN(date.getTime()) ||
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return null;
      }

      return date;
    } catch {
      return null;
    }
  }, [format]);

  // Convert date to YYYY-MM-DD for calendar component
  const toCalendarFormat = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate date
  const validateDate = useCallback((dateString: string): string => {
    if (required && !dateString.trim()) {
      return 'Date is required';
    }

    if (!dateString.trim()) return '';

    const date = parseDate(dateString);
    if (!date) {
      return `Invalid date format. Use ${format}`;
    }

    if (minDate && date < minDate) {
      return `Date must be after ${formatDate(minDate)}`;
    }

    if (maxDate && date > maxDate) {
      return `Date must be before ${formatDate(maxDate)}`;
    }

    return '';
  }, [required, parseDate, minDate, maxDate, format, formatDate]);

  // Handle text input change
  const handleTextChange = useCallback((text: string) => {
    setTextValue(text);
    
    if (isTouched) {
      const validationError = validateDate(text);
      setError(validationError);
    }

    // Notify parent of change
    if (!validationError) {
      onChange?.(text);
    }
  }, [isTouched, validateDate, onChange]);

  // Handle text input blur
  const handleBlur = useCallback(() => {
    setIsTouched(true);
    const validationError = validateDate(textValue);
    setError(validationError);
  }, [textValue, validateDate]);

  // Handle calendar date selection
  const handleDateSelect = useCallback((day: any) => {
    const selectedDate = new Date(day.dateString);
    const formattedDate = formatDate(selectedDate);
    
    setTextValue(formattedDate);
    setError('');
    setIsTouched(true);
    onChange?.(formattedDate);
    setIsModalVisible(false);
  }, [formatDate, onChange]);

  // Handle clear
  const handleClear = useCallback(() => {
    setTextValue('');
    setError('');
    onChange?.('');
  }, [onChange]);

  // Get marked dates for calendar
  const markedDates = useMemo(() => {
    if (!textValue) return {};

    const date = parseDate(textValue);
    if (!date) return {};

    const calendarDate = toCalendarFormat(date);
    return {
      [calendarDate]: {
        selected: true,
        selectedColor: '#2196F3',
      },
    };
  }, [textValue, parseDate]);

  // Get min/max dates in calendar format
  const minDateString = minDate ? toCalendarFormat(minDate) : undefined;
  const maxDateString = maxDate ? toCalendarFormat(maxDate) : undefined;

  const hasError = isTouched && error.length > 0;
  const borderColor = hasError ? '#F44336' : disabled ? '#E0E0E0' : '#BDBDBD';

  return (
    <View style={styles.container}>
      <Text style={[styles.label, disabled && styles.disabledText]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, { borderColor }]}>
          <TextInput
            style={[styles.input, disabled && styles.disabledText]}
            value={textValue}
            onChangeText={handleTextChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            placeholderTextColor="#9E9E9E"
            editable={!disabled}
            accessibilityLabel={label}
            accessibilityHint={`Enter date in ${format} format`}
            accessibilityState={{ disabled, invalid: hasError }}
          />

          {textValue && !disabled ? (
            <TouchableOpacity
              onPress={handleClear}
              style={styles.clearButton}
              accessibilityLabel="Clear date"
              accessibilityRole="button"
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <TouchableOpacity
          style={[styles.calendarButton, disabled && styles.disabledButton]}
          onPress={() => !disabled && setIsModalVisible(true)}
          disabled={disabled}
          accessibilityLabel="Open calendar"
          accessibilityRole="button"
        >
          <Ionicons name="calendar-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {hasError && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      <Text style={styles.formatHint}>Format: {format}</Text>

      {/* Calendar Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
                accessibilityLabel="Close calendar"
                accessibilityRole="button"
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <Calendar
              onDayPress={handleDateSelect}
              markedDates={markedDates}
              minDate={minDateString}
              maxDate={maxDateString}
              theme={{
                selectedDayBackgroundColor: '#2196F3',
                todayTextColor: '#2196F3',
                arrowColor: '#2196F3',
              }}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsModalVisible(false)}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#212121',
  },
  clearButton: {
    paddingHorizontal: 12,
  },
  clearIcon: {
    fontSize: 16,
    color: '#757575',
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  disabledText: {
    color: '#9E9E9E',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  formatHint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 24,
    color: '#757575',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
  },
});

