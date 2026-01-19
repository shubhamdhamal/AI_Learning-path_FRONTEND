import React from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  error,
  hint,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  editable = true,
  style,
  inputStyle,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={[
        styles.inputContainer,
        error && styles.inputError,
        !editable && styles.inputDisabled,
      ]}>
        {icon && (
          <View style={styles.iconContainer}>
            {typeof icon === 'string' ? (
              <Ionicons name={icon} size={20} color={Colors.text.darkSecondary} />
            ) : (
              icon
            )}
          </View>
        )}
        
        <RNTextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            icon && styles.inputWithIcon,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.darkSecondary}
          multiline={multiline}
          numberOfLines={numberOfLines}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.text.dark,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.dark,
  },
  inputError: {
    borderColor: Colors.status.error,
  },
  inputDisabled: {
    backgroundColor: '#e2e8f0',
    opacity: 0.7,
  },
  iconContainer: {
    paddingLeft: Spacing.base,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSizes.base,
    color: Colors.text.dark,
  },
  inputWithIcon: {
    paddingLeft: Spacing.sm,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.status.error,
    marginTop: Spacing.xs,
  },
  hintText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.text.darkSecondary,
    marginTop: Spacing.xs,
  },
});
