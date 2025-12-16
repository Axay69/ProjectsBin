import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

type RootStackParamList = { HapticFeedbackDemo: undefined };
type Props = NativeStackScreenProps<RootStackParamList, 'HapticFeedbackDemo'>;

export default function HapticFeedbackDemoScreen({}: Props) {
  const options = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haptic Feedback – Real Life Examples</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {/* Like button / small tap */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('impactLight', options)
          }
        >
          <Text style={styles.buttonText}>
            Impact Light → Like button / small tap
          </Text>
        </TouchableOpacity>

        {/* Long press / card press */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('impactMedium', options)
          }
        >
          <Text style={styles.buttonText}>
            Impact Medium → Card press / long-press action
          </Text>
        </TouchableOpacity>

        {/* Drag start / delete confirm */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('impactHeavy', options)
          }
        >
          <Text style={styles.buttonText}>
            Impact Heavy → Drag start / delete confirmation
          </Text>
        </TouchableOpacity>

        {/* Picker / tab / list selection */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('selection', options)
          }
        >
          <Text style={styles.buttonText}>
            Selection → Tab switch / picker scroll
          </Text>
        </TouchableOpacity>

        {/* Form submit success */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('notificationSuccess', options)
          }
        >
          <Text style={styles.buttonText}>
            Success → Payment done / form submitted
          </Text>
        </TouchableOpacity>

        {/* Warning before action */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('notificationWarning', options)
          }
        >
          <Text style={styles.buttonText}>Warning → “Are you sure?” state</Text>
        </TouchableOpacity>

        {/* Error feedback */}
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            ReactNativeHapticFeedback.trigger('notificationError', options)
          }
        >
          <Text style={styles.buttonText}>
            Error → Wrong password / failed action
          </Text>
        </TouchableOpacity>

        {/* iOS soft touch (subtle UX polish) */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => ReactNativeHapticFeedback.trigger('soft', options)}
        >
          <Text style={styles.buttonText}>Soft → Keyboard-like subtle tap</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  list: { gap: 12 },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#111827',
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
});
