import React, { useMemo, useState } from 'react';
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
  GROUP_VIDEO_CALL_CONFIG,
  ZegoMenuBarButtonName
} from '@zegocloud/zego-uikit-prebuilt-call-rn';

type RootStackParamList = {
  ZegoScreenCastingDemo: undefined;
};

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ZegoScreenCastingDemo'
>;

const APP_ID = 1761586308;
const APP_SIGN =
  '1783423303c23878d46867ea3bedaa62a32c06afdc1b3eedf221abc94b1402e1';

export default function ZegoScreenCastingDemoScreen({ navigation }: Props) {
  const [userID, setUserID] = useState('caster1');
  const [userName, setUserName] = useState('Caster 1');
  const [callID, setCallID] = useState('castRoom1');
  const [isPresenter, setIsPresenter] = useState(true);
  const [useSpeakerWhenJoining, setUseSpeakerWhenJoining] = useState(true);
  const [inCall, setInCall] = useState(false);

  const idPattern = useMemo(() => /^[a-zA-Z0-9_]+$/, []);

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

  if (inCall) {
    const config = {
      ...GROUP_VIDEO_CALL_CONFIG,
      onHangUp: handleHangUp,
      useSpeakerWhenJoining,
      layout: {
        ...GROUP_VIDEO_CALL_CONFIG.layout,
      },
      bottomMenuBarConfig: {
        buttons: [
          ZegoMenuBarButtonName.toggleCameraButton,
          ZegoMenuBarButtonName.switchCameraButton,
          ZegoMenuBarButtonName.hangUpButton,
          ZegoMenuBarButtonName.toggleMicrophoneButton,
          ZegoMenuBarButtonName.switchAudioOutputButton,
        ],
      },
      topMenuBarConfig: {
        buttons: [ZegoMenuBarButtonName.showMemberListButton],
      },
    };

    return (
      <View style={styles.callContainer}>
        <View style={styles.callTopBar}>
          <View style={{ flex: 1 }}>
            <Text style={styles.callTitle}>
              {isPresenter ? 'Presenter' : 'Viewer'} Mode
            </Text>
            <Text style={styles.callSubtitle}>Call ID: {callID}</Text>
          </View>
          {Platform.OS === 'android' && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>Android screen casting supported</Text>
            </View>
          )}
        </View>
        <View style={styles.infoBanner}>
          <Text style={styles.infoBannerTitle}>
            {isPresenter ? 'How to cast' : 'How to watch'}
          </Text>
          <Text style={styles.infoBannerText}>
            {isPresenter
              ? 'Use the screen sharing toggle in the call UI to start casting (Android). All users in the same Call ID will see your screen.'
              : 'Join with the same Call ID to view the presenter’s shared screen when they start casting.'}
          </Text>
          <Text style={styles.infoBannerSmall}>
            Screen casting requires gallery layout and Android permissions. iOS
            screen casting needs a Broadcast Upload Extension.
          </Text>
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
        <Text style={styles.title}>ZegoCloud Screen Casting Demo</Text>
        <Text style={styles.subtitle}>One caster, many viewers</Text>
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
              All participants must use the same Call ID
            </Text>
          </View>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Presenter Mode</Text>
              <Text style={styles.toggleHint}>
                Enable if you plan to start screen casting
              </Text>
            </View>
            <Switch value={isPresenter} onValueChange={setIsPresenter} />
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

          <View style={styles.buttonGroup}>
            <TouchableOpacity style={styles.startButton} onPress={handleStart}>
              <Text style={styles.buttonText}>Start</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>Notes</Text>
            <Text style={styles.infoText}>
              Android: the call UI can expose a screen sharing toggle when
              supported by the SDK. Required permissions are added in
              AndroidManifest. iOS: real screen casting requires a Broadcast
              Upload Extension.
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
    marginTop: 12,
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
    marginTop: 16,
  },
  startButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
  infoBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  infoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#E5E7EB',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#D1D5DB',
    marginTop: 4,
  },
  infoBannerSmall: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  notice: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  noticeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E5E7EB',
  },
});

