import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCameraDevice } from 'react-native-vision-camera';
import {
  PhotoRecognizer,
  Camera,
} from 'react-native-vision-camera-text-recognition';
import { launchImageLibrary } from 'react-native-image-picker';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

type RootStackParamList = {
  TextRecognitionDemo: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'TextRecognitionDemo'>;

type RecognitionMode = 'recognize' | 'translate' | 'photo';
type Language = 'latin' | 'chinese' | 'devanagari' | 'japanese' | 'korean';

export default function TextRecognitionDemoScreen({ navigation }: Props) {
  const logDebug = (...args: any[]) => console.log('[TextRec]', ...args);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [mode, setMode] = useState<RecognitionMode>('recognize');
  const [language, setLanguage] = useState<Language>('latin');
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [textBlocks, setTextBlocks] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const device = useCameraDevice('back');

  useEffect(() => {
    checkPermissions();
    logDebug('Mounted TextRecognitionDemoScreen');
  }, []);

  useEffect(() => {
    logDebug('Mode changed:', mode, 'Language:', language);
  }, [mode, language]);

  const checkPermissions = async () => {
    if (Platform.OS === 'ios') {
      const result = await request(PERMISSIONS.IOS.CAMERA);
      setHasPermission(result === RESULTS.GRANTED);
      logDebug('iOS camera permission result:', result);
    } else {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      setHasPermission(result === RESULTS.GRANTED);
      logDebug('Android camera permission result:', result);
    }
  };

  const handlePhotoRecognition = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) {
        return;
      }

      const uri = result.assets[0].uri;
      setSelectedImage(uri);
      setIsProcessing(true);
      logDebug('Photo selected:', uri);

      const recognitionResult = await PhotoRecognizer({ uri });

      if (recognitionResult) {
        setRecognizedText(recognitionResult.resultText || '');
        setTextBlocks(recognitionResult.blocks || []);
        logDebug(
          'Photo recognize success:',
          'text length',
          recognitionResult.resultText?.length ?? 0,
          'blocks',
          recognitionResult.blocks?.length ?? 0,
        );
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to recognize text: ${error.message}`);
      logDebug('Photo recognize error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Checking permissions...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Camera permission denied</Text>
        <TouchableOpacity style={styles.button} onPress={checkPermissions}>
          <Text style={styles.buttonText}>Request Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera View */}
      {mode !== 'photo' && (
        <View style={styles.cameraContainer}>
          {mode === 'recognize' && (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={isActive}
              resizeMode="contain"
              options={{ language }}
              mode={'recognize'}
              callback={(data: any) => {
                try {
                  let blocks: any[] = [];
                  let text = '';
                  if (Array.isArray(data)) {
                    blocks = data;
                    text = data
                      .map((b: any) => b.resultText || b.blockText || '')
                      .filter(Boolean)
                      .join('\n');
                  } else if (typeof data === 'string') {
                    text = data;
                  } else if (data) {
                    blocks = data.blocks || data.result?.blocks || [];
                    text =
                      data.resultText || data.text || data.result?.text || '';
                  }
                  setTextBlocks(blocks);
                  setRecognizedText(text);
                } catch (e) {
                  console.log('[TextRec] Camera callback parse error', e);
                }
              }}
            />
          )}
          {mode === 'translate' && (
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              resizeMode="contain"
              isActive={isActive}
              options={{ from: 'en', to: 'es' }}
              mode={'translate'}
              callback={(data: any) => {
                try {
                  let text = '';
                  console.log('data--', data);

                  if (typeof data === 'string') text = data;
                  else if (data) text = data.translatedText || data.text || '';
                  setTranslatedText(text);
                } catch (e) {
                  console.log('[TextRec] Camera callback parse error', e);
                }
              }}
            />
          )}
          <View style={styles.cameraOverlay}>
            <View style={styles.controls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  !isActive && styles.controlButtonInactive,
                ]}
                onPress={() => setIsActive(!isActive)}
              >
                <Text style={styles.controlButtonText}>
                  {isActive ? 'Pause' : 'Resume'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Photo Recognition View */}
      {mode === 'photo' && (
        <View style={styles.photoContainer}>
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              style={styles.photoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>No image selected</Text>
            </View>
          )}
          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}
        </View>
      )}

      {/* Controls Panel */}
      <View style={styles.panel}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Mode Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mode</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'recognize' && styles.modeButtonActive,
                ]}
                onPress={() => setMode('recognize')}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'recognize' && styles.modeButtonTextActive,
                  ]}
                >
                  Recognize
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'translate' && styles.modeButtonActive,
                ]}
                onPress={() => setMode('translate')}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'translate' && styles.modeButtonTextActive,
                  ]}
                >
                  Translate
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  mode === 'photo' && styles.modeButtonActive,
                ]}
                onPress={() => setMode('photo')}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === 'photo' && styles.modeButtonTextActive,
                  ]}
                >
                  Photo
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Language Selection (for recognition mode) */}
          {mode === 'recognize' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Language</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
                style={styles.languageScroll}
              >
                {(
                  [
                    'latin',
                    'chinese',
                    'devanagari',
                    'japanese',
                    'korean',
                  ] as Language[]
                ).map(lang => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.languageButton,
                      language === lang && styles.languageButtonActive,
                    ]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text
                      style={[
                        styles.languageButtonText,
                        language === lang && styles.languageButtonTextActive,
                      ]}
                    >
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Photo Recognition Button */}
          {mode === 'photo' && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePhotoRecognition}
              >
                <Text style={styles.primaryButtonText}>
                  Select & Recognize Photo
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Results */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {mode === 'translate' ? 'Translated Text' : 'Recognized Text'}
            </Text>
            <View style={styles.resultBox}>
              {mode === 'translate' ? (
                <Text style={styles.resultText}>
                  {translatedText || 'No translation yet...'}
                </Text>
              ) : (
                <Text style={styles.resultText}>
                  {recognizedText || 'No text recognized yet...'}
                </Text>
              )}
            </View>
          </View>

          {/* Text Blocks Details */}
          {mode === 'recognize' && textBlocks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Text Blocks ({textBlocks.length})
              </Text>
              {textBlocks.map((block: any, index: number) => (
                <View key={index} style={styles.blockCard}>
                  <Text style={styles.blockTitle}>Block {index + 1}</Text>
                  <Text style={styles.blockText}>
                    {block.blockText || block.resultText || 'N/A'}
                  </Text>
                  {block.blockFrame && (
                    <Text style={styles.blockMeta}>
                      Position: ({block.blockFrame.x?.toFixed(0)},{' '}
                      {block.blockFrame.y?.toFixed(0)}) | Size:{' '}
                      {block.blockFrame.width?.toFixed(0)} ×{' '}
                      {block.blockFrame.height?.toFixed(0)}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Info */}
          <View style={styles.section}>
            <Text style={styles.infoText}>
              💡 Tips:{'\n'}• Point camera at text for real-time recognition
              {'\n'}• Use Photo mode to recognize text from existing images
              {'\n'}• Switch languages based on the text you're scanning{'\n'}•
              Translation mode translates English to Spanish
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
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 20,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controlButtonInactive: {
    backgroundColor: 'rgba(255, 0, 0, 0.6)',
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  photoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: '#fff',
    fontSize: 16,
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  panel: {
    height: '50%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  languageScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  languageButtonActive: {
    backgroundColor: '#10b981',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  languageButtonTextActive: {
    color: '#fff',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultText: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  blockCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 4,
  },
  blockText: {
    fontSize: 14,
    color: '#111827',
    marginBottom: 4,
  },
  blockMeta: {
    fontSize: 11,
    color: '#9ca3af',
  },
  statusText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
});
