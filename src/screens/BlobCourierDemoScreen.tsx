import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import BlobCourier from 'react-native-blob-courier';
import { launchImageLibrary } from 'react-native-image-picker';
import { Platform } from 'react-native';

type RootStackParamList = {
  BlobCourierDemo: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'BlobCourierDemo'>;

type DemoMode = 'download' | 'upload' | 'multipart' | 'downloadManager';

export default function BlobCourierDemoScreen({ navigation }: Props) {
  const [mode, setMode] = useState<DemoMode>('download');
  const [url, setUrl] = useState(
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  );
  const [uploadFilePath, setUploadFilePath] = useState('');
  const [filename, setFilename] = useState('downloaded_file.pdf');
  const [progress, setProgress] = useState({ written: 0, total: 0 });
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [opStartTime, setOpStartTime] = useState<number | null>(null);
  const [avgSpeedBps, setAvgSpeedBps] = useState(0);
  const [etaSeconds, setEtaSeconds] = useState<number | null>(null);
  const [customPathInput, setCustomPathInput] = useState('');

  const log = (...args: any[]) => console.log('[BlobCourierDemo]', ...args);

  // Test server URLs (using httpbin.org for testing)
  const testUploadUrl = 'https://httpbin.org/post';
  const testDownloadUrl =
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const handleDownload = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    setIsLoading(true);
    setStatus('Downloading...');
    setProgress({ written: 0, total: 0 });
    setResult(null);
    setOpStartTime(Date.now());
    setAvgSpeedBps(0);
    setEtaSeconds(null);
    log('Download start', { url, filename });

    try {
      const response = await BlobCourier.settings({
        progressIntervalMilliseconds: 100,
      })
        .onProgress(e => {
          setProgress({ written: e.written, total: e.total });
          const pct = e.total > 0 ? (e.written / e.total) * 100 : 0;
          setStatus(`Downloading: ${pct.toFixed(1)}%`);
          if (opStartTime) {
            const elapsed = (Date.now() - opStartTime) / 1000;
            if (elapsed > 0) {
              const speed = e.written / elapsed;
              setAvgSpeedBps(speed);
              if (e.total > 0 && speed > 0)
                setEtaSeconds(Math.max(0, (e.total - e.written) / speed));
            }
          }
          log('Download progress', {
            written: e.written,
            total: e.total,
            pct: pct.toFixed(2),
          });
        })
        .fetchBlob({
          url: url,
          filename: filename || 'downloaded_file',
          method: 'GET',
          mimeType: 'application/octet-stream',
        });

      setStatus('Download completed!');
      setResult({
        type: response.type,
        filePath: response.data.absoluteFilePath,
        result: 'result' in response.data ? response.data.result : 'N/A',
      });
      log('Download success', {
        filePath: response.data.absoluteFilePath,
        type: response.type,
      });
      Alert.alert(
        'Success',
        `File downloaded to:\n${response.data.absoluteFilePath}`,
      );
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      log('Download error', error);
      Alert.alert('Download Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadFilePath) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsLoading(true);
    setStatus('Uploading...');
    setProgress({ written: 0, total: 0 });
    setResult(null);
    setOpStartTime(Date.now());
    setAvgSpeedBps(0);
    setEtaSeconds(null);
    log('Upload start', { path: uploadFilePath, url: testUploadUrl });

    try {
      const mime = guessMimeType(uploadFilePath);
      const base = getFileName(uploadFilePath);
      const response = await BlobCourier.settings({
        progressIntervalMilliseconds: 100,
      })
        .onProgress(e => {
          setProgress({ written: e.written, total: e.total });
          const pct = e.total > 0 ? (e.written / e.total) * 100 : 0;
          setStatus(`Uploading: ${pct.toFixed(1)}%`);
          if (opStartTime) {
            const elapsed = (Date.now() - opStartTime) / 1000;
            if (elapsed > 0) {
              const speed = e.written / elapsed;
              setAvgSpeedBps(speed);
              if (e.total > 0 && speed > 0)
                setEtaSeconds(Math.max(0, (e.total - e.written) / speed));
            }
          }
          log('Upload progress', {
            written: e.written,
            total: e.total,
            pct: pct.toFixed(2),
          });
        })
        .uploadBlob({
          url: testUploadUrl,
          absoluteFilePath: uploadFilePath.replace('file://', ''),
          method: 'POST',
          mimeType: mime || 'application/octet-stream',
          headers: {
            'X-Custom-Header': 'BlobCourier-Demo',
            'X-Filename': base,
          },
          returnResponse: true,
        });

      setStatus('Upload completed!');
      setResult({
        filePath: response.absoluteFilePath,
        responseCode: response.response.code,
        responseHeaders: response.response.headers,
      });
      log('Upload success', {
        code: response.response.code,
        filePath: response.absoluteFilePath,
      });
      Alert.alert(
        'Success',
        `Upload completed!\nResponse Code: ${response.response.code}`,
      );
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      log('Upload error', error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultipartUpload = async () => {
    if (!uploadFilePath) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    setIsLoading(true);
    setStatus('Uploading multipart...');
    setProgress({ written: 0, total: 0 });
    setResult(null);
    setOpStartTime(Date.now());
    setAvgSpeedBps(0);
    setEtaSeconds(null);
    log('Multipart start', { path: uploadFilePath, url: testUploadUrl });

    try {
      const mime = guessMimeType(uploadFilePath) || 'application/octet-stream';
      const base = getFileName(uploadFilePath) || 'file';
      const response = await BlobCourier.settings({
        progressIntervalMilliseconds: 100,
      })
        .onProgress(e => {
          setProgress({ written: e.written, total: e.total });
          const pct = e.total > 0 ? (e.written / e.total) * 100 : 0;
          setStatus(`Uploading: ${pct.toFixed(1)}%`);
          if (opStartTime) {
            const elapsed = (Date.now() - opStartTime) / 1000;
            if (elapsed > 0) {
              const speed = e.written / elapsed;
              setAvgSpeedBps(speed);
              if (e.total > 0 && speed > 0)
                setEtaSeconds(Math.max(0, (e.total - e.written) / speed));
            }
          }
          log('Multipart progress', {
            written: e.written,
            total: e.total,
            pct: pct.toFixed(2),
          });
        })
        .uploadParts({
          url: testUploadUrl,
          method: 'POST',
          parts: {
            file: {
              type: 'file',
              payload: {
                absoluteFilePath: uploadFilePath.replace('file://', ''),
                mimeType: mime,
                filename: base,
              },
            },
            textField: {
              type: 'string',
              payload: 'Hello from BlobCourier!',
            },
            anotherField: {
              type: 'string',
              payload: 'Multipart upload demo',
            },
          },
          returnResponse: true,
        });

      setStatus('Multipart upload completed!');
      setResult({
        responseCode: response.response.code,
        responseHeaders: response.response.headers,
      });
      log('Multipart success', { code: response.response.code });
      Alert.alert(
        'Success',
        `Multipart upload completed!\nResponse Code: ${response.response.code}`,
      );
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      log('Multipart error', error);
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadWithManager = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (Platform.OS !== 'android') {
      Alert.alert(
        'Info',
        'Android Download Manager is only available on Android',
      );
      return;
    }

    setIsLoading(true);
    setStatus('Starting download with Android Download Manager...');
    setResult(null);
    log('Android DM start', { url, filename });

    try {
      const response = await BlobCourier.useDownloadManagerOnAndroid({
        title: 'BlobCourier Demo Download',
        description: 'Downloading file using Android Download Manager',
        enableNotifications: true,
      }).fetchBlob({
        url: url,
        filename: filename || 'downloaded_file',
        method: 'GET',
        mimeType: 'application/octet-stream',
        android: {
          useDownloadManager: true,
          target: 'data',
        },
      });

      setStatus('Download started in Android Download Manager!');
      setResult({
        filePath: response.data.absoluteFilePath,
        type: response.type,
      });
      log('Android DM success', { filePath: response.data.absoluteFilePath });
      Alert.alert(
        'Success',
        'Download started in Android Download Manager.\nCheck your notifications!',
      );
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      log('Android DM error', error);
      Alert.alert('Download Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const pickFile = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'mixed',
        quality: 1,
        videoQuality: 'high',
        selectionLimit: 1,
      });

      if (result.didCancel || !result.assets?.[0]?.uri) {
        return;
      }

      const uri = result.assets[0].uri;
      setUploadFilePath(uri);
      setStatus(
        `File selected: ${
          result.assets[0].fileName || uri.split('/').pop() || 'file'
        }`,
      );
      log('File picked', { uri, name: result.assets[0].fileName });
    } catch (error: any) {
      Alert.alert('Error', `Failed to pick file: ${error.message}`);
    }
  };

  const getProgressPercentage = () => {
    if (progress.total === 0) return 0;
    return (progress.written / progress.total) * 100;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Mode</Text>
          <View style={styles.modeContainer}>
            {(
              [
                'download',
                'upload',
                'multipart',
                'downloadManager',
              ] as DemoMode[]
            ).map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modeButton,
                  mode === m && styles.modeButtonActive,
                ]}
                onPress={() => setMode(m)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mode === m && styles.modeButtonTextActive,
                  ]}
                >
                  {m === 'downloadManager'
                    ? 'Android DM'
                    : m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Download Mode */}
        {mode === 'download' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Download URL</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="Enter download URL"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Filename</Text>
              <TextInput
                style={styles.input}
                value={filename}
                onChangeText={setFilename}
                placeholder="Enter filename"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  isLoading && styles.primaryButtonDisabled,
                ]}
                onPress={handleDownload}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Download File</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Select File to Upload</Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={pickFile}
              >
                <Text style={styles.secondaryButtonText}>
                  Pick Image/Video File
                </Text>
              </TouchableOpacity>
              {uploadFilePath ? (
                <Text style={styles.filePathText} numberOfLines={1}>
                  Selected: {uploadFilePath.split('/').pop()}
                </Text>
              ) : null}
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Or enter absolute file path</Text>
              <TextInput
                style={styles.input}
                value={customPathInput}
                onChangeText={setCustomPathInput}
                placeholder="/absolute/path/to/file"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (!customPathInput || isLoading) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={() => {
                  if (!customPathInput) return;
                  setUploadFilePath(customPathInput);
                  setStatus(`File selected: ${getFileName(customPathInput)}`);
                  log('File path set', { path: customPathInput });
                }}
                disabled={!customPathInput || isLoading}
              >
                <Text style={styles.primaryButtonText}>Use Path</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Upload URL</Text>
              <TextInput
                style={styles.input}
                value={testUploadUrl}
                editable={false}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.hintText}>Using httpbin.org for testing</Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || !uploadFilePath) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleUpload}
                disabled={isLoading || !uploadFilePath}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Upload File</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Multipart Upload Mode */}
        {mode === 'multipart' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Select File for Multipart Upload</Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={pickFile}
              >
                <Text style={styles.secondaryButtonText}>
                  Pick Image/Video File
                </Text>
              </TouchableOpacity>
              {uploadFilePath ? (
                <Text style={styles.filePathText} numberOfLines={1}>
                  Selected: {uploadFilePath.split('/').pop()}
                </Text>
              ) : null}
            </View>
            <View style={styles.section}>
              <Text style={styles.infoText}>
                This will upload a file along with text fields in a multipart
                form.
              </Text>
            </View>
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || !uploadFilePath) &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleMultipartUpload}
                disabled={isLoading || !uploadFilePath}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Upload Multipart</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Android Download Manager Mode */}
        {mode === 'downloadManager' && (
          <>
            <View style={styles.section}>
              <Text style={styles.label}>Download URL</Text>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="Enter download URL"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Filename</Text>
              <TextInput
                style={styles.input}
                value={filename}
                onChangeText={setFilename}
                placeholder="Enter filename"
                placeholderTextColor="#9ca3af"
              />
            </View>
            {Platform.OS !== 'android' && (
              <View style={styles.section}>
                <Text style={styles.warningText}>
                  ⚠️ Android Download Manager is only available on Android
                  devices
                </Text>
              </View>
            )}
            <View style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || Platform.OS !== 'android') &&
                    styles.primaryButtonDisabled,
                ]}
                onPress={handleDownloadWithManager}
                disabled={isLoading || Platform.OS !== 'android'}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>
                    Download with Android DM
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Progress Indicator */}
        {isLoading && progress.total > 0 && (
          <View style={styles.section}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${getProgressPercentage()}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>
                {getProgressPercentage().toFixed(1)}% (
                {formatBytes(progress.written)} / {formatBytes(progress.total)})
              </Text>
              <Text style={styles.progressText}>
                {avgSpeedBps > 0 ? `${formatBytes(avgSpeedBps)}/s` : '—'}{' '}
                {etaSeconds != null ? `ETA ${formatEta(etaSeconds)}` : ''}
              </Text>
            </View>
          </View>
        )}

        {/* Status */}
        {status ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.statusBox}>
              <Text style={styles.statusText}>{status}</Text>
            </View>
          </View>
        ) : null}

        {/* Result */}
        {result && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Result</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                {JSON.stringify(result, null, 2)}
              </Text>
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.section}>
          <Text style={styles.infoTitle}>Features Demonstrated:</Text>
          <Text style={styles.infoText}>
            ✓ File download with progress tracking{'\n'}✓ File upload with
            progress tracking{'\n'}✓ Multipart form uploads{'\n'}✓ Android
            Download Manager integration{'\n'}✓ Custom headers and methods{'\n'}
            ✓ Progress callbacks{'\n'}✓ Response handling
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileName(path: string): string {
  const p = path.replace('file://', '');
  const parts = p.split('/');
  return parts[parts.length - 1] || p;
}

function getExt(path: string): string {
  const name = getFileName(path);
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : '';
}

function guessMimeType(path: string): string | null {
  const ext = getExt(path);
  if (!ext) return null;
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    heic: 'image/heic',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    m4v: 'video/x-m4v',
    avi: 'video/x-msvideo',
    pdf: 'application/pdf',
    txt: 'text/plain',
    json: 'application/json',
    csv: 'text/csv',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
  };
  return map[ext] || null;
}

function formatEta(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  const mm = m.toString().padStart(2, '0');
  const ss = rem.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  modeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
  },
  modeButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  hintText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 14,
    fontWeight: '600',
  },
  filePathText: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusBox: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  statusText: {
    fontSize: 14,
    color: '#111827',
  },
  resultBox: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  resultText: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  warningText: {
    fontSize: 13,
    color: '#f59e0b',
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
  },
});
