import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ZegoUIKitPrebuiltCall,
  ONE_ON_ONE_VIDEO_CALL_CONFIG,
  ONE_ON_ONE_VOICE_CALL_CONFIG,
  GROUP_VIDEO_CALL_CONFIG,
  GROUP_VOICE_CALL_CONFIG,
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

type RootStackParamList = {
  ZegoCloudProDemo: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'ZegoCloudProDemo'>;

const APP_ID = 1761586308;
const APP_SIGN =
  '1783423303c23878d46867ea3bedaa62a32c06afdc1b3eedf221abc94b1402e1';

export default function ZegoCloudProDemoScreen({ navigation }: Props) {
  const [userID, setUserID] = useState('proUser1');
  const [userName, setUserName] = useState('Pro User 1');
  const [callID, setCallID] = useState('proCall1');
  const [mode, setMode] = useState<'one_on_one' | 'group'>('one_on_one');
  const [kind, setKind] = useState<'video' | 'voice'>('video');
  const [turnOnCameraWhenJoining, setTurnOnCameraWhenJoining] = useState(true);
  const [turnOnMicrophoneWhenJoining, setTurnOnMicrophoneWhenJoining] =
    useState(true);
  const [useSpeakerWhenJoining, setUseSpeakerWhenJoining] = useState(true);
  const [inCall, setInCall] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const idPattern = useMemo(() => /^[a-zA-Z0-9_]+$/, []);

  useEffect(() => {
    if (inCall) {
      setStartTime(Date.now());
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000) as unknown as number;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsed(0);
      setStartTime(null);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [inCall]);

  const validateInputs = () => {
    if (!userID.trim() || !userName.trim() || !callID.trim()) {
      Alert.alert('Error', 'Fill in User ID, User Name and Call ID');
      return false;
    }
    if (!idPattern.test(userID) || !idPattern.test(callID)) {
      Alert.alert(
        'Error',
        'User ID and Call ID can only contain letters, numbers and underscores',
      );
      return false;
    }
    return true;
  };

  const handleStart = () => {
    if (!validateInputs()) return;
    setInCall(true);
  };

  const handleHangUp = () => {
    setInCall(false);
    navigation.goBack();
  };

  const formatElapsed = () => {
    const s = elapsed % 60;
    const m = Math.floor(elapsed / 60) % 60;
    const h = Math.floor(elapsed / 3600);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  };

  if (inCall) {
    const baseConfig =
      mode === 'one_on_one'
        ? kind === 'video'
          ? ONE_ON_ONE_VIDEO_CALL_CONFIG
          : ONE_ON_ONE_VOICE_CALL_CONFIG
        : kind === 'video'
          ? GROUP_VIDEO_CALL_CONFIG
          : GROUP_VOICE_CALL_CONFIG;

    const config = {
      ...baseConfig,
      onHangUp: handleHangUp,
      onCallEnd: (_cID: string, _reason: number, duration: number) => {
        setInCall(false);
        const mins = Math.floor(duration / 60);
        const secs = Math.floor(duration % 60);
        Alert.alert('Call ended', `Duration ${mins}m ${secs}s`);
        navigation.goBack();
      },
      turnOnCameraWhenJoining,
      turnOnMicrophoneWhenJoining,
      useSpeakerWhenJoining,
    };

    return (
      <View style={styles.callContainer}>
        <View style={styles.callTopBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.callTitle}>
              {mode === 'one_on_one' ? '1-on-1' : 'Group'}{' '}
              {kind === 'video' ? 'Video' : 'Voice'} Call
            </Text>
            <Text style={styles.callSubtitle}>Call ID: {callID}</Text>
          </View>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>{formatElapsed()}</Text>
          </View>
        </View>
        <ZegoUIKitPrebuiltCall
          appID={APP_ID}
          appSign={APP_SIGN}
          userID={userID}
          userName={userName}
          callID={callID}
          config={config}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ZegoCloud Pro Demo</Text>
        <Text style={styles.subtitle}>One-on-one / Group with join options</Text>
      </View>

      <View style={styles.form}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1, gap: 16 }}
        >
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your User ID</Text>
            <TextInput
              style={styles.input}
              value={userID}
              onChangeText={setUserID}
              placeholder="letters / numbers / underscores"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Name</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="display name"
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Call ID</Text>
            <TextInput
              style={styles.input}
              value={callID}
              onChangeText={setCallID}
              placeholder="shared among participants"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              Users join the same call by using this Call ID
            </Text>
          </View>

          <View style={styles.segmentGroup}>
            <Text style={styles.segmentLabel}>Mode</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  mode === 'one_on_one' && styles.segmentButtonActive,
                ]}
                onPress={() => setMode('one_on_one')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'one_on_one' && styles.segmentTextActive,
                  ]}
                >
                  1-on-1
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  mode === 'group' && styles.segmentButtonActive,
                ]}
                onPress={() => setMode('group')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'group' && styles.segmentTextActive,
                  ]}
                >
                  Group
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.segmentGroup}>
            <Text style={styles.segmentLabel}>Type</Text>
            <View style={styles.segmentRow}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  kind === 'video' && styles.segmentButtonActive,
                ]}
                onPress={() => setKind('video')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    kind === 'video' && styles.segmentTextActive,
                  ]}
                >
                  Video
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  kind === 'voice' && styles.segmentButtonActive,
                ]}
                onPress={() => setKind('voice')}
              >
                <Text
                  style={[
                    styles.segmentText,
                    kind === 'voice' && styles.segmentTextActive,
                  ]}
                >
                  Voice
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.toggles}>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Camera on when joining</Text>
                <Text style={styles.toggleHint}>
                  Turn on local camera at call start
                </Text>
              </View>
              <Switch
                value={turnOnCameraWhenJoining}
                onValueChange={setTurnOnCameraWhenJoining}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Microphone on when joining</Text>
                <Text style={styles.toggleHint}>
                  Enable local mic at call start
                </Text>
              </View>
              <Switch
                value={turnOnMicrophoneWhenJoining}
                onValueChange={setTurnOnMicrophoneWhenJoining}
              />
            </View>
            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.toggleTitle}>Use speaker when joining</Text>
                <Text style={styles.toggleHint}>
                  Route audio to speaker on start
                </Text>
              </View>
              <Switch
                value={useSpeakerWhenJoining}
                onValueChange={setUseSpeakerWhenJoining}
              />
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[
                styles.button,
                kind === 'video' ? styles.videoButton : styles.voiceButton,
              ]}
              onPress={handleStart}
            >
              <Text style={styles.buttonText}>
                {kind === 'video' ? 'Start Video Call' : 'Start Voice Call'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Instructions</Text>
            <Text style={styles.infoText}>
              1. Pick mode and type, set join options{'\n'}
              2. Share the Call ID with others{'\n'}
              3. Everyone joins with the same Call ID{'\n'}
              4. Use group mode for 3+ participants
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
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
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
  segmentGroup: {
    marginTop: 16,
    gap: 10,
  },
  segmentLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  segmentButtonActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  segmentTextActive: {
    color: '#1e40af',
  },
  toggles: {
    marginTop: 10,
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    gap: 10,
  },
  toggleTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111',
  },
  toggleHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  buttonGroup: {
    marginTop: 12,
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
    marginTop: 16,
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
  callContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  callTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 36 : 16,
    paddingBottom: 10,
    backgroundColor: '#0B1220',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    gap: 12,
  },
  callTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  callSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  timerBox: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
});
