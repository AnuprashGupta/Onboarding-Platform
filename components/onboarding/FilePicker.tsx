import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';

export interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType?: string;
}

export interface FilePickerProps {
  label: string;
  value?: SelectedFile[];
  onChange?: (files: SelectedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in bytes
  maxTotalSize?: number; // in bytes
  allowedTypes?: string[]; // mime types or extensions
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({
  label,
  value = [],
  onChange,
  maxFiles = 3,
  maxSizePerFile = 5 * 1024 * 1024, // 5MB default
  maxTotalSize = 15 * 1024 * 1024, // 15MB default
  allowedTypes = ['*/*'],
  disabled = false,
  required = false,
  helperText,
}) => {
  const [files, setFiles] = useState<SelectedFile[]>(value);
  const [error, setError] = useState<string>('');
  const [isTouched, setIsTouched] = useState(false);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename: string): string => {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
  };

  // Check if file type is allowed
  const isFileTypeAllowed = (mimeType?: string, filename?: string): boolean => {
    // If no restrictions, allow all
    if (allowedTypes.includes('*/*')) return true;

    // Check mime type
    if (mimeType) {
      for (const allowed of allowedTypes) {
        // Exact match
        if (allowed === mimeType) return true;
        
        // Wildcard match (e.g., image/*)
        if (allowed.endsWith('/*')) {
          const baseType = allowed.split('/')[0];
          if (mimeType.startsWith(baseType + '/')) return true;
        }
      }
    }

    // Check file extension
    if (filename) {
      const extension = getFileExtension(filename);
      for (const allowed of allowedTypes) {
        if (allowed.startsWith('.') && allowed.substring(1) === extension) {
          return true;
        }
      }
    }

    return false;
  };

  // Validate files
  const validateFiles = useCallback((selectedFiles: SelectedFile[]): string => {
    if (required && selectedFiles.length === 0) {
      return 'At least one file is required';
    }

    if (selectedFiles.length > maxFiles) {
      return `Maximum ${maxFiles} file(s) allowed`;
    }

    // Check individual file sizes
    for (const file of selectedFiles) {
      if (file.size > maxSizePerFile) {
        return `${file.name} exceeds maximum size of ${formatFileSize(maxSizePerFile)}`;
      }
    }

    // Check total size
    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    if (totalSize > maxTotalSize) {
      return `Total size ${formatFileSize(totalSize)} exceeds maximum of ${formatFileSize(maxTotalSize)}`;
    }

    return '';
  }, [required, maxFiles, maxSizePerFile, maxTotalSize]);

  // Handle file selection
  const handlePickFiles = async () => {
    try {
      setIsTouched(true);

      // Check if we can add more files
      if (files.length >= maxFiles) {
        setError(`Maximum ${maxFiles} file(s) allowed`);
        Alert.alert('Limit Reached', `You can only select up to ${maxFiles} file(s)`);
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        multiple: files.length + 1 < maxFiles,
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      // Process selected files
      const newFiles: SelectedFile[] = [];
      
      if (result.assets) {
        for (const asset of result.assets) {
          // Validate file type
          if (!isFileTypeAllowed(asset.mimeType, asset.name)) {
            Alert.alert(
              'Invalid File Type',
              `${asset.name} is not an allowed file type.\nAllowed: ${allowedTypes.join(', ')}`
            );
            continue;
          }

          // Validate file size
          if (asset.size && asset.size > maxSizePerFile) {
            Alert.alert(
              'File Too Large',
              `${asset.name} (${formatFileSize(asset.size)}) exceeds maximum size of ${formatFileSize(maxSizePerFile)}`
            );
            continue;
          }

          newFiles.push({
            uri: asset.uri,
            name: asset.name,
            size: asset.size || 0,
            mimeType: asset.mimeType,
          });
        }
      }

      if (newFiles.length === 0) {
        return;
      }

      // Add new files to existing files
      const updatedFiles = [...files, ...newFiles].slice(0, maxFiles);

      // Validate all files
      const validationError = validateFiles(updatedFiles);
      setError(validationError);

      if (!validationError) {
        setFiles(updatedFiles);
        onChange?.(updatedFiles);
      }
    } catch (err) {
      console.error('Error picking files:', err);
      Alert.alert('Error', 'Failed to pick files. Please try again.');
    }
  };

  // Handle file removal
  const handleRemoveFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onChange?.(updatedFiles);

    // Revalidate
    const validationError = validateFiles(updatedFiles);
    setError(validationError);
  }, [files, onChange, validateFiles]);

  // Clear all files
  const handleClearAll = useCallback(() => {
    setFiles([]);
    onChange?.([]);
    setError('');
  }, [onChange]);

  const getTotalSize = () => {
    return files.reduce((sum, file) => sum + file.size, 0);
  };

  const hasError = isTouched && error.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, disabled && styles.disabledText]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {files.length > 0 && (
          <TouchableOpacity
            onPress={handleClearAll}
            disabled={disabled}
            accessibilityLabel="Clear all files"
            accessibilityRole="button"
          >
            <Text style={styles.clearAllText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {helperText && <Text style={styles.helperText}>{helperText}</Text>}

      {/* File selection button */}
      <TouchableOpacity
        style={[
          styles.pickButton,
          disabled && styles.disabledButton,
          hasError && styles.errorButton,
        ]}
        onPress={handlePickFiles}
        disabled={disabled || files.length >= maxFiles}
        accessibilityLabel="Select files"
        accessibilityRole="button"
        accessibilityHint={`Select up to ${maxFiles} files`}
      >
        <Ionicons name="document-attach-outline" size={24} color="#FFFFFF" style={styles.pickButtonIcon} />
        <Text style={styles.pickButtonText}>
          {files.length === 0
            ? 'Select Files'
            : files.length >= maxFiles
            ? 'Maximum Files Reached'
            : 'Add More Files'}
        </Text>
      </TouchableOpacity>

      {/* File list */}
      {files.length > 0 && (
        <View style={styles.fileListContainer}>
          <Text style={styles.fileListTitle}>
            Selected Files ({files.length}/{maxFiles})
          </Text>
          
          <ScrollView style={styles.fileList}>
            {files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.fileSize}>
                    {formatFileSize(file.size)}
                    {file.mimeType && ` • ${file.mimeType.split('/')[1]?.toUpperCase()}`}
                  </Text>
                </View>
                
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveFile(index)}
                  disabled={disabled}
                  accessibilityLabel={`Remove ${file.name}`}
                  accessibilityRole="button"
                >
                  <Text style={styles.removeIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.summary}>
            <Text style={styles.summaryText}>
              Total: {formatFileSize(getTotalSize())} / {formatFileSize(maxTotalSize)}
            </Text>
          </View>
        </View>
      )}

      {/* Error message */}
      {hasError && (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}

      {/* Constraints info */}
      <View style={styles.constraints}>
        <Text style={styles.constraintText}>
          • Max {maxFiles} file(s) • Up to {formatFileSize(maxSizePerFile)} each
        </Text>
        {allowedTypes.length > 0 && !allowedTypes.includes('*/*') && (
          <Text style={styles.constraintText}>
            • Allowed: {allowedTypes.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  required: {
    color: '#F44336',
  },
  clearAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  errorButton: {
    borderWidth: 2,
    borderColor: '#F44336',
  },
  pickButtonIcon: {
    marginRight: 8,
  },
  pickButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fileListContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FAFAFA',
  },
  fileListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  fileList: {
    maxHeight: 200,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
  },
  removeButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#FFEBEE',
  },
  removeIcon: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  summary: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  summaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
  },
  disabledText: {
    color: '#9E9E9E',
  },
  constraints: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
  },
  constraintText: {
    fontSize: 11,
    color: '#616161',
    marginBottom: 2,
  },
});

