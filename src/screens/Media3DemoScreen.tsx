import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  NativeModules,
  TextInput,
  Alert,
  ActivityIndicator,
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

const { NativeMedia3Module } = NativeModules as any;

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

  const runTextOverlay = async () => {
    if (!singleVideo) {
       Alert.alert('Missing video', 'Please pick a video first.');
       return;
    }
    setLogs('Adding Text Overlay...');
    setStatus('Processing');
    setBusy(true);
    try {
      // Hardcoded pos (100, 200) for demo, user can change time range in trim inputs or we can add new ones
      // Using trimStart/trimEnd for overlay duration
      const out = await NativeMedia3Module.addTextOverlay(
        singleVideo, 
        overlayText, 
        100, 
        200, 
        Number(trimStart), 
        Number(trimEnd)
      );
      setLogs(`Overlay complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runRotate = async () => {
    if (!singleVideo) {
       Alert.alert('Missing video', 'Please pick a video first.');
       return;
    }
    setLogs(`Rotating ${rotateDeg} degrees...`);
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.rotate(singleVideo, Number(rotateDeg));
      setLogs(`Rotation complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runFlip = async (horizontal: boolean, vertical: boolean) => {
    if (!singleVideo) {
       Alert.alert('Missing video', 'Please pick a video first.');
       return;
    }
    setLogs(`Flipping ${horizontal ? 'Horizontal' : ''} ${vertical ? 'Vertical' : ''}...`);
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.flip(singleVideo, horizontal, vertical);
      setLogs(`Flip complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runCrop = async () => {
    if (!singleVideo) {
       Alert.alert('Missing video', 'Please pick a video first.');
       return;
    }
    const [x, y, w, h] = cropVals.split(',').map(Number);
    if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
      Alert.alert('Invalid crop', 'Format: x,y,w,h');
      return;
    }
    
    setLogs(`Cropping to ${w}x${h} at (${x},${y})...`);
    setStatus('Processing');
    setBusy(true);
    try {
      // Native expects left, top, right, bottom (coords, not dimensions for right/bottom)
      // Right = x + w, Bottom = y + h
      const out = await NativeMedia3Module.crop(singleVideo, x, y, x + w, y + h);
      setLogs(`Crop complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runExtractFrame = async () => {
    if (!singleVideo) {
       Alert.alert('Missing video', 'Please pick a video first.');
       return;
    }
    setLogs(`Extracting frame at ${extractTime}ms...`);
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.extractFrame(singleVideo, Number(extractTime));
      setLogs(`Frame extracted\nPath: ${out}`);
      setStatus('Completed');
      setOutputUri(out); // Will display image in preview if supported or just log
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

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

  const pickVideoSingle = async () => {
    try {
      const res = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1, quality: 0.5 });
      const asset = res.assets?.[0];
      if (!asset || !asset.uri) return;
      const local = await ensureLocalFile(asset.uri);
      setSingleVideo(local);
    } catch (e: any) {
      Alert.alert('Pick failed', e.message);
    }
  };

  const pickVideo = async (target: 'A' | 'B') => {
    try {
      const res = await launchImageLibrary({ mediaType: 'video', selectionLimit: 1, quality: 0.5 });
      const asset = res.assets?.[0];
      if (!asset || !asset.uri) return;
      const local = await ensureLocalFile(asset.uri);
      if (target === 'A') setVideoA(local);
      else setVideoB(local);
    } catch (e: any) {
      Alert.alert('Pick failed', e.message);
    }
  };

  const runTrim = async () => {
    if (!singleVideo) {
      Alert.alert('Missing video', 'Please pick a video first.');
      return;
    }
    if (!NativeMedia3Module) {
      setLogs('NativeMedia3Module is not available. Please run on Android and ensure the native module is linked.');
      return;
    }
    setLogs('Trimming...');
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.trim(singleVideo, Number(trimStart), Number(trimEnd));
      setLogs(`Trim completed\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runSpeed = async () => {
    if (!singleVideo) {
      Alert.alert('Missing video', 'Please pick a video first.');
      return;
    }
    if (!NativeMedia3Module) {
      setLogs('NativeMedia3Module is not available. Please run on Android and ensure the native module is linked.');
      return;
    }
    setLogs('Changing speed...');
    setStatus('Processing');
    setBusy(true);
    try {
      const s = Number(speed);
      const out = await NativeMedia3Module.changeSpeed(singleVideo, s, preservePitch);
      setLogs(`Speed change completed\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runMergeSideBySide = async () => {
    if (!videoA || !videoB) {
      Alert.alert('Missing videos', 'Please pick video A and video B.');
      return;
    }
    if (!NativeMedia3Module) return;
    setLogs('Merging Side-by-Side...');
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.mergeSideBySide(videoA, videoB);
      setLogs(`Merge complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runMergeTopBottom = async () => {
    if (!videoA || !videoB) {
      Alert.alert('Missing videos', 'Please pick video A and video B.');
      return;
    }
    if (!NativeMedia3Module) return;
    setLogs('Merging Top-Bottom...');
    setStatus('Processing');
    setBusy(true);
    try {
      const out = await NativeMedia3Module.mergeTopBottom(videoA, videoB);
      setLogs(`Merge complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runCut = async () => {
    if (!singleVideo) {
      Alert.alert('Missing video', 'Please pick a video first.');
      return;
    }
    setLogs('Cutting (removing middle part)...');
    setStatus('Processing');
    setBusy(true);
    try {
      // Cut removes the part between start and end
      const out = await NativeMedia3Module.cut(singleVideo, Number(trimStart), Number(trimEnd));
      setLogs(`Cut complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runImageToVideo = async () => {
    if (!singleVideo) { // Reusing singleVideo for image input
       Alert.alert('Missing image', 'Please pick an image (using same picker for now).');
       return;
    }
    setLogs('Converting Image to Video...');
    setStatus('Processing');
    setBusy(true);
    try {
      const res = await launchImageLibrary({ mediaType: 'photo', quality: 1, selectionLimit: 1,  });
      const inputImg = res.didCancel ? null : res?.assets && res.assets.length > 0 ? res.assets[0] : null;
      if (!inputImg) {
        Alert.alert('Image picker canceled', 'Please pick an image.');
        setLogs('Image picker canceled');
        setStatus('Failed');

        return;
      }
      const out = await NativeMedia3Module.imageToVideo(inputImg.uri, 5000); // 5 seconds default
      setLogs(`Conversion complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };

  const runTranscode = async () => {
    if (!singleVideo) {
      Alert.alert('Missing video', 'Please pick a video first.');
      return;
    }
    setLogs('Transcoding/Compressing...');
    setStatus('Processing');
    setBusy(true);
    try {
      // Example: 720p, default bitrate
      const out = await NativeMedia3Module.transcode(singleVideo, 1280, 720, 0); 
      setLogs(`Transcode complete\nOutput: ${out}`);
      setStatus('Completed');
      setOutputUri(out);
      setBusy(false);
    } catch (e: any) {
      console.error(e);
      setLogs(`Error: ${e.message}`);
      setStatus('Failed');
      setBusy(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>Media3 Editor</Text>
        <Text style={styles.subHeader}>Trim · Speed · Merge — native Android Media3 powered</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Source</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity
              style={[styles.primaryButton, { flex: 1, marginRight: 8 }]}
              onPress={pickVideoSingle}
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
          <Text style={styles.smallText}>Selected: {singleVideo || 'None'}</Text>
          {singleVideo ? (
            <View style={styles.previewRow}>
              <View style={styles.previewBox}>
                <Video source={{ uri: singleVideo }} style={styles.previewVideo} resizeMode="contain" paused={false} controls />
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trim</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { marginRight: 8 }]} value={trimStart} onChangeText={setTrimStart} placeholder="Start ms" keyboardType="numeric" editable={!busy} />
            <TextInput style={styles.input} value={trimEnd} onChangeText={setTrimEnd} placeholder="End ms" keyboardType="numeric" editable={!busy} />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={runTrim} disabled={busy || !singleVideo}>
            <Text style={styles.primaryButtonText}>{busy ? 'Processing…' : 'Trim Video'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Speed</Text>
          <View style={styles.row}>
            <TextInput style={styles.input} value={speed} onChangeText={setSpeed} placeholder="Speed (e.g., 0.5 or 1.5)" keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'decimal-pad'} editable={!busy} />
          </View>
          <View style={[styles.row, { alignItems: 'center', marginTop: 8 }]}> 
            <Text style={{ marginRight: 8 }}>Preserve Pitch</Text>
            <Switch value={preservePitch} onValueChange={setPreservePitch} disabled={busy} />
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={runSpeed} disabled={busy || !singleVideo}>
            <Text style={styles.primaryButtonText}>{busy ? 'Processing…' : 'Apply Speed'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Advanced Edits</Text>
          
          {/* Text Overlay */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Text Overlay (Time: Start-End above)</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2 }]} value={overlayText} onChangeText={setOverlayText} placeholder="Text" />
              <TouchableOpacity style={styles.secondaryButton} onPress={runTextOverlay} disabled={busy || !singleVideo}>
                <Text style={styles.buttonText}>Add Text</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Rotate */}
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

          {/* Crop */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Crop (x,y,w,h)</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2 }]} value={cropVals} onChangeText={setCropVals} />
              <TouchableOpacity style={styles.secondaryButton} onPress={runCrop} disabled={busy || !singleVideo}>
                <Text style={styles.buttonText}>Crop</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Extract Frame */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Extract Frame (ms)</Text>
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 1 }]} value={extractTime} onChangeText={setExtractTime} keyboardType="numeric" />
              <TouchableOpacity style={styles.secondaryButton} onPress={runExtractFrame} disabled={busy || !singleVideo}>
                <Text style={styles.buttonText}>Extract</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>New Features</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1, marginRight: 8 }]} onPress={runCut} disabled={busy || !singleVideo}>
              <Text style={styles.secondaryButtonText}>Cut (Remove Middle)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={runTranscode} disabled={busy || !singleVideo}>
              <Text style={styles.secondaryButtonText}>Compress (720p)</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowCentered}>
            <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={runImageToVideo} disabled={busy || !singleVideo}>
               <Text style={styles.secondaryButtonText}>Img -&gt; Vid (5s)</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Merge Videos</Text>
          <View style={styles.rowCentered}>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1, marginRight: 8 }]} onPress={() => pickVideo('A')} disabled={busy}>
              <Text style={styles.primaryButtonText}>{videoA ? 'Change A' : 'Pick A'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.primaryButton, { flex: 1 }]} onPress={() => pickVideo('B')} disabled={busy}>
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

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardTitle}>Output</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {busy ? <ActivityIndicator color="#1976D2" /> : null}
              <Text style={[styles.smallText, { marginLeft: 8 }]}>Status: {status}</Text>
            </View>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>Logs</Text>
          <View style={styles.logBox}>
            <Text style={styles.logText}>{logs || 'No logs yet.'}</Text>
          </View>

          {outputUri ? (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Preview</Text>
              <View style={styles.videoContainer}>
                {outputUri.endsWith('.jpg') || outputUri.endsWith('.png') ? (
                  <Image source={{ uri: outputUri }} style={styles.video} resizeMode="contain" />
                ) : (
                  <Video source={{ uri: outputUri }} style={styles.video} controls resizeMode="contain" />
                )}
              </View>
              <Text style={styles.smallText}>{outputUri}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6F9' },
  scroll: { padding: 16, paddingBottom: 24 },
  header: { fontSize: 26, fontWeight: '800', marginBottom: 6, color: '#0D1B2A' },
  subHeader: { fontSize: 14, color: '#4E5D6C', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, color: '#0D1B2A' },
  input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E6ED', borderRadius: 10, padding: 12, fontSize: 16, color: '#0D1B2A', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowCentered: { flexDirection: 'row', alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E6ECF2', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0D1B2A', marginBottom: 8 },
  primaryButton: { backgroundColor: '#1976D2', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#EEF5FF', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, alignItems: 'center', borderWidth: 1, marginVertical: 12, borderColor: '#D0E4FF' },
  secondaryButtonText: { color: '#1976D2', fontSize: 13, fontWeight: '700' },
  smallText: { fontSize: 12, color: '#4E5D6C' },
  logBox: { backgroundColor: '#0B1020', padding: 12, borderRadius: 10, marginTop: 6, minHeight: 140 },
  logText: { color: '#7CFC8A', fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) as string, fontSize: 12 },
  videoContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginTop: 8 },
  video: { width: '100%', height: '100%' },
  previewRow: { flexDirection: 'row', marginTop: 8 },
  previewBox: { aspectRatio: 1, width: '100%', borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  previewVideo: { width: '100%', height: '100%' },
  inputGroup: { marginBottom: 16 },
  buttonText: { color: '#1976D2', fontSize: 13, fontWeight: '700' },
});
