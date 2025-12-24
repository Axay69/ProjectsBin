import React from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
}

export default function SearchBar({ value, onChangeText, onSubmit }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="magnify" size={24} color={theme.colors.textSecondary} />
      <TextInput
        style={styles.input}
        placeholder="Search songs, albums..."
        placeholderTextColor={theme.colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <MaterialCommunityIcons name="close" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.m,
    paddingVertical: theme.spacing.s,
    marginVertical: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    color: theme.colors.text,
    marginLeft: theme.spacing.s,
    fontSize: 16,
  },
});
