import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

type RootStackParamList = {
  ZegoCloudDemo: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ZegoCloudDemo'>;

const APP_ID = 1761586308;
const APP_SIGN =
  '1783423303c23878d46867ea3bedaa62a32c06afdc1b3eedf221abc94b1402e1';

export default function ZegoCloudDemoScreen({ navigation }: Props) {
  const [myUserID, setMyUserID] = useState('user1');
  const [targetUserID, setTargetUserID] = useState('user2');
  const [callID, setCallID] = useState('call1');
  const [callType, setCallType] = useState<'video' | 'voice' | null>(null);

  const handleStartCall = (type: 'video' | 'voice') => {
    if (!myUserID.trim() || !targetUserID.trim() || !callID.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate user IDs and call ID (only alphanumeric and underscore)
    const idPattern = /^[a-zA-Z0-9_]+$/;
    if (
      !idPattern.test(myUserID) ||
      !idPattern.test(targetUserID) ||
      !idPattern.test(callID)
    ) {
      Alert.alert(
        'Error',
        'User IDs and Call ID can only contain letters, numbers, and underscores',
      );
      return;
    }

    setCallType(type);
  };

  const handleHangUp = () => {
    setCallType(null);
    navigation.goBack();
  };

  const handleOnlySelfInRoom = () => {
    setCallType(null);
    Alert.alert('No one joined', 'Waiting for the other user to join...');
  };

  if (callType) {
    const config =
      callType === 'video'
        ? {
            ...ONE_ON_ONE_VIDEO_CALL_CONFIG,
            onHangUp: handleHangUp,
            onOnlySelfInRoom: handleOnlySelfInRoom,
          }
        : {
            ...ONE_ON_ONE_VOICE_CALL_CONFIG,
            onHangUp: handleHangUp,
            onOnlySelfInRoom: handleOnlySelfInRoom,
          };

    return (
      <View style={styles.container}>
        <ZegoUIKitPrebuiltCall
          appID={APP_ID}
          appSign={APP_SIGN}
          userID={myUserID}
          userName={`User ${myUserID}`}
          callID={callID}
          config={config}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ZegoCloud Call Demo</Text>
        <Text style={styles.subtitle}>1-on-1 Voice & Video Calls</Text>
      </View>

      <View style={styles.form}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your User ID</Text>
            <TextInput
              style={styles.input}
              value={myUserID}
              onChangeText={setMyUserID}
              placeholder="Enter your user ID"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Only letters, numbers, and underscores allowed
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target User ID</Text>
            <TextInput
              style={styles.input}
              value={targetUserID}
              onChangeText={setTargetUserID}
              placeholder="Enter target user ID"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>The user you want to call</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Call ID</Text>
            <TextInput
              style={styles.input}
              value={callID}
              onChangeText={setCallID}
              placeholder="Enter call ID"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Unique identifier for this call session
            </Text>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.videoButton]}
              onPress={() => handleStartCall('video')}
            >
              <Text style={styles.buttonText}>📹 Start Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.voiceButton]}
              onPress={() => handleStartCall('voice')}
            >
              <Text style={styles.buttonText}>📞 Start Voice Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>ℹ️ Instructions:</Text>
            <Text style={styles.infoText}>
              1. Enter your User ID and the target User ID{'\n'}
              2. Both users should use the same Call ID{'\n'}
              3. Click "Start Video Call" or "Start Voice Call"{'\n'}
              4. The other user should join with the same Call ID
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 60 : 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buttonGroup: {
    marginTop: 10,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  videoButton: {
    backgroundColor: '#3b82f6',
  },
  voiceButton: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
