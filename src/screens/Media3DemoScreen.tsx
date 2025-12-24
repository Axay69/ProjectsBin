import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Switch,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import Video from 'react-native-video';
import { MediaEngine, EditConfig } from '../lib/MediaEngine';

export default function Media3DemoScreen() {
  const [singleVideo, setSingleVideo] = useState<string | null>(null);
  const [videoA, setVideoA] = useState<string | null>(null);
  const [videoB, setVideoB] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [status, setStatus] = useState<'Idle' | 'Processing' | 'Completed' | 'Failed'>('Idle');
  const [busy, setBusy] = useState(false);
  const [outputUri, setOutputUri] = useState<string | null>(null);

  const [trimStart, setTrimStart] = useState<string>('0');
  const [trimEnd, setTrimEnd] = useState<string>('5000');
  const [speed, setSpeed] = useState<string>('1.5');
  const [preservePitch, setPreservePitch] = useState<boolean>(true);

  const [overlayText, setOverlayText] = useState('Hello World');
  const [rotateDeg, setRotateDeg] = useState('90');
  const [extractTime, setExtractTime] = useState('1000');
  const [cropVals, setCropVals] = useState('0,0,500,500'); // x,y,w,h

  // Helper to handle MediaEngine calls
  const runEngineOp = async (name: string, op: () => Promise<string>) => {
    setLogs(`${name}...`);
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await op();
      setLogs(`${name} complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
    } finally {
      setBusy(false);
    }
  };

  const runTextOverlay = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    // Note: Universal processVideo applies overlay to the whole duration currently
    runEngineOp('Adding Text Overlay', () => 
      MediaEngine.process(singleVideo, {
        overlay: { text: overlayText, x: 100, y: 200 }
      })
    );
  };

  const runRotate = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp(`Rotating ${rotateDeg}°`, () => 
      MediaEngine.process(singleVideo, {
        rotation: Number(rotateDeg)
      })
    );
  };

  const runFlip = (horizontal: boolean, vertical: boolean) => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp(`Flipping ${horizontal ? 'H' : ''}${vertical ? 'V' : ''}`, () => 
      MediaEngine.process(singleVideo, {
        flip: { horizontal, vertical }
      })
    );
  };

  const runCrop = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    const [x, y, w, h] = cropVals.split(',').map(Number);
    if (isNaN(x)) return Alert.alert('Invalid crop');
    
    runEngineOp(`Cropping to ${w}x${h}`, () => 
      MediaEngine.process(singleVideo, {
        crop: { left: x, top: y, right: x + w, bottom: y + h }
      })
    );
  };

  const runExtractFrame = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp('Extracting frame', () => 
      MediaEngine.extractFrame(singleVideo, Number(extractTime))
    );
  };

  const runTrim = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp('Trimming', () => 
      MediaEngine.process(singleVideo, {
        trim: { start: Number(trimStart), end: Number(trimEnd) }
      })
    );
  };

  const runSpeed = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp('Changing speed', () => 
      MediaEngine.process(singleVideo, {
        speed: Number(speed)
        // preservePitch is handled by default in native or we can add to config if needed
      })
    );
  };

  const runMergeSideBySide = () => {
    if (!videoA || !videoB) return Alert.alert('Missing videos');
    runEngineOp('Merging Side-by-Side', () => 
      MediaEngine.merge(videoA, videoB, 'side-by-side')
    );
  };

  const runMergeTopBottom = () => {
    if (!videoA || !videoB) return Alert.alert('Missing videos');
    runEngineOp('Merging Top-Bottom', () => 
      MediaEngine.merge(videoA, videoB, 'top-bottom')
    );
  };

  const runCut = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp('Cutting (removing middle)', () => 
      MediaEngine.cut(singleVideo, Number(trimStart), Number(trimEnd))
    );
  };

  const runImageToVideo = async () => {
    if (!singleVideo) return Alert.alert('Missing image', 'Please pick an image (using same picker for now).');
    try {
      setBusy(true);
      const res = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1 });
      const inputImg = res.assets?.[0];
      if (!inputImg?.uri) {
        setBusy(false);
        return;
      }
      runEngineOp('Img -> Vid', () => MediaEngine.imageToVideo(inputImg.uri!, 5000));
    } catch (e: any) {
      setBusy(false);
      Alert.alert('Error', e.message);
    }
  };

  const runTranscode = () => {
    if (!singleVideo) return Alert.alert('Missing video');
    runEngineOp('Compressing (720p)', () => 
      MediaEngine.process(singleVideo, {
        compression: 'HEVC_720P'
      })
    );
  };

  // --- File Helpers ---
  const ensureLocalFile = async (uri: string) => {
    const fileLike = uri.startsWith('file://');
    const srcPath = fileLike ? uri.replace('file://', '') : uri;
    try {
      const dest = `${RNFS.CachesDirectoryPath}/${Date.now()}_${(uri.split('/').pop() || 'video').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;
      if (fileLike) {
        await RNFS.copyFile(srcPath, dest);
        return `file://${dest}`;
      }
      const data = await RNFetchBlob.fs.readFile(uri, 'base64');
      await RNFetchBlob.fs.writeFile(dest, data, 'base64');
      return `file://${dest}`;
    } catch (e: any) {
      throw new Error(`Unable to copy selected file locally: ${e.message}`);
    }
  };

  const pickVideo = async (setter: (uri: string | null) => void) => {
    try {
      const res = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1, quality: 0.5 });
      const asset = res.assets?.[0];
      if (!asset?.uri) return;
      const local = await ensureLocalFile(asset.uri);
      setter(local);
    } catch (e: any) {
      Alert.alert('Pick failed', e.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Universal Media Engine</Text>
        <Text style={styles.subHeader}>Powered by MediaEngine.ts & Media3</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Source</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
              onPress={() => pickVideo(setSingleVideo)}
              disabled={busy}
            >
              <Text style={styles.primaryButtonText}>{singleVideo ? 'Change Source' : 'Pick Source'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, {  justifyContent: 'center' }]}
              onPress={() => { setSingleVideo(null); setOutputUri(null); }}
              disabled={busy || !singleVideo}
            >
              <Text style={styles.secondaryButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.smallText} numberOfLines={1}>Selected: {singleVideo || 'None'}</Text>
          {singleVideo ? (
            <View style={styles.previewRow}>
              <View style={styles.previewBox}>
                <Video source={{ uri: singleVideo }} style={styles.previewVideo} resizeMode="contain" paused={false} controls />
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trim & Speed</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { marginRight: 8 }]} value={trimStart} onChangeText={setTrimStart} placeholder="Start ms" keyboardType="numeric" editable={!busy} />
            <TextInput style={styles.input} value={trimEnd} onChangeText={setTrimEnd} placeholder="End ms" keyboardType="numeric" editable={!busy} />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={runTrim} disabled={busy || !singleVideo}>
            <Text style={styles.primaryButtonText}>Trim Video</Text>
          </TouchableOpacity>
          
          <View style={[styles.row, { marginTop: 12 }]}>
            <TextInput style={styles.input} value={speed} onChangeText={setSpeed} placeholder="Speed" keyboardType="numeric" editable={!busy} />
             <TouchableOpacity style={[styles.primaryButton, { marginLeft: 8, flex: 1 }]} onPress={runSpeed} disabled={busy || !singleVideo}>
              <Text style={styles.primaryButtonText}>Apply Speed</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transformations</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rotate / Flip</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={rotateDeg} onChangeText={setRotateDeg} keyboardType="numeric" placeholder="Deg" />
              <TouchableOpacity style={[styles.secondaryButton, { marginRight: 8 }]} onPress={runRotate} disabled={busy || !singleVideo}>
                <Text style={styles.secondaryButtonText}>Rotate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.secondaryButton, { marginRight: 8 }]} onPress={() => runFlip(true, false)} disabled={busy || !singleVideo}>
                <Text style={styles.secondaryButtonText}>Flip H</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => runFlip(false, true)} disabled={busy || !singleVideo}>
                <Text style={styles.secondaryButtonText}>Flip V</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Crop (x,y,w,h)</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2 }]} value={cropVals} onChangeText={setCropVals} />
              <TouchableOpacity style={styles.secondaryButton} onPress={runCrop} disabled={busy || !singleVideo}>
                <Text style={styles.buttonText}>Crop</Text>
              </TouchableOpacity>
            </View>
          </View>
          
           <View style={styles.inputGroup}>
            <Text style={styles.label}>Text Overlay</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2 }]} value={overlayText} onChangeText={setOverlayText} placeholder="Text" />
              <TouchableOpacity style={styles.secondaryButton} onPress={runTextOverlay} disabled={busy || !singleVideo}>
                <Text style={styles.buttonText}>Add Text</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tools</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]} onPress={runCut} disabled={busy || !singleVideo}>
              <Text style={styles.secondaryButtonText}>Cut Middle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={runTranscode} disabled={busy || !singleVideo}>
              <Text style={styles.secondaryButtonText}>Compress 720p</Text>
            </TouchableOpacity>
          </View>
           <View style={[styles.rowCentered, { marginTop: 8 }]}>
             <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} value={extractTime} onChangeText={setExtractTime} keyboardType="numeric" placeholder="Time ms" />
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={runExtractFrame} disabled={busy || !singleVideo}>
               <Text style={styles.secondaryButtonText}>Extract Frame</Text>
            </TouchableOpacity>
          </View>
           <View style={[styles.rowCentered, { marginTop: 8 }]}>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={runImageToVideo} disabled={busy || !singleVideo}>
               <Text style={styles.secondaryButtonText}>Img -&gt; Vid (5s)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Merge Videos</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginRight: 8 }]} onPress={() => pickVideo(setVideoA)} disabled={busy}>
              <Text style={styles.primaryButtonText}>{videoA ? 'Change A' : 'Pick A'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => pickVideo(setVideoB)} disabled={busy}>
              <Text style={styles.primaryButtonText}>{videoB ? 'Change B' : 'Pick B'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: 8 }}>
            <Text style={styles.smallText}>A: {videoA ? videoA.split('/').pop() : 'None'}</Text>
            <Text style={styles.smallText}>B: {videoB ? videoB.split('/').pop() : 'None'}</Text>
          </View>
          <View style={styles.rowCentered}>
             <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginRight: 8 }]} onPress={runMergeSideBySide} disabled={busy || !videoA || !videoB}>
              <Text style={styles.primaryButtonText}>Side-by-Side</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={runMergeTopBottom} disabled={busy || !videoA || !videoB}>
              <Text style={styles.primaryButtonText}>Top-Bottom</Text>
            </TouchableOpacity>
          </View>
        </View>

        {outputUri ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Output Preview</Text>
            <View style={styles.previewRow}>
              <View style={styles.previewBox}>
                {outputUri.toLowerCase().endsWith('.mp4') ? (
                  <Video
                    source={{ uri: outputUri }}
                    style={styles.previewVideo}
                    resizeMode="contain"
                    paused={false}
                    controls
                  />
                ) : (
                  <Image
                    source={{ uri: outputUri }}
                    style={styles.previewVideo}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
            <Text style={styles.smallText}>Path: {outputUri}</Text>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: '#f0f0f0' }]}>
          <Text style={styles.cardTitle}>Logs</Text>
          <Text style={styles.logText}>{logs}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Status: {status}</Text>
          {outputUri ? <Text style={styles.smallText}>Output: {outputUri}</Text> : null}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 16 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subHeader: { fontSize: 14, color: '#666', marginBottom: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    borderWidth: 1,
    borderColor: '#eee'
  },
  cardTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowCentered: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    height: 40,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: { color: '#fff', fontWeight: '600' },
  secondaryButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  secondaryButtonText: { color: '#333' },
  buttonText: { color: '#333' },
  previewRow: { marginTop: 12, height: 200 },
  previewBox: { flex: 1, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' },
  previewVideo: { width: '100%', height: '100%' },
  smallText: { fontSize: 12, color: '#666', marginTop: 4 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, marginBottom: 4, color: '#333' },
  logText: { fontSize: 12, fontFamily: 'monospace', color: '#333' },
});
