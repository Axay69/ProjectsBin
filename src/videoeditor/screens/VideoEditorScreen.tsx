import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { launchImageLibrary } from 'react-native-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnLoadData } from 'react-native-video';

import {
  VideoPreview,
  Timeline,
  EditorToolbar,
  ToolPanel,
  ExportModal,
  OperationsQueue,
  EditorHeader,
} from '../components';
import { useEditorStore } from '../store/editorStore';
import { VideoMetadata } from '../types/editor';
import { exportVideo } from '../lib/VideoExportEngine';
import { colors } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type RootStackParamList = {
  VideoEditor: { videoUri?: string } | undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'VideoEditor'>;

const VideoEditorScreen: React.FC<Props> = ({ navigation, route }) => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const {
    project,
    activeMode,
    initProject,
    resetProject,
    setExportProgress,
  } = useEditorStore();

  // Initialize project from route params or open picker
  useEffect(() => {
    const videoUri = route.params?.videoUri;

    if (videoUri) {
      initProject({
        uri: videoUri,
        duration: 30,
        width: 1080,
        height: 1920,
        rotation: 0,
      });
    } else {
      openVideoPicker();
    }

    return () => {
      resetProject();
    };
  }, []);

  // Open video picker
  const openVideoPicker = useCallback(async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        videoQuality: 'high',
      });

      if (result.assets && result.assets.length > 0) {
        const video = result.assets[0];

        const metadata: VideoMetadata = {
          uri: video.uri || '',
          duration: video.duration || 30,
          width: video.width || 1080,
          height: video.height || 1920,
          rotation: 0,
        };

        initProject(metadata);
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to open video picker');
      navigation.goBack();
    }
  }, [initProject, navigation]);

  // Handle video load
  const handleVideoLoad = useCallback(
    (data: OnLoadData) => {
      setVideoLoaded(true);

      if (project) {
        useEditorStore.setState({
          project: {
            ...project,
            source: {
              ...project.source,
              duration: data.duration,
            },
          },
          trimEnd: data.duration,
        });
      }
    },
    [project]
  );

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (project?.operations.length) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved edits. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [project, navigation]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!project) return;

    try {
      const simulateProgress = async () => {
        const steps = [
          { progress: 10, delay: 500 },
          { progress: 30, delay: 1000 },
          { progress: 50, delay: 1500 },
          { progress: 70, delay: 2000 },
          { progress: 90, delay: 2500 },
          { progress: 100, delay: 3000 },
        ];

        for (const step of steps) {
          await new Promise((resolve) => setTimeout(() => {resolve;}, step.delay));
          setExportProgress(step.progress);
        }
      };

      const [outputUri] = await Promise.all([
        exportVideo(project, (progress, step) => {
          console.log(`Export: ${progress}% - ${step}`);
        }),
        simulateProgress(),
      ]);

      console.log('Export complete:', outputUri);
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Export Failed', 'There was an error exporting your video.');
    }
  }, [project, setExportProgress]);

  const hasActivePanel = activeMode !== 'none';

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <EditorHeader
          onBack={handleBack}
          onExport={() => setShowExportModal(true)}
        />

        {/* Operations Queue */}
        {/* <OperationsQueue /> */}

        {/* Main Content - Flexible layout */}
        <View style={styles.content}>
          {/* Video Preview */}
          <View style={[styles.previewContainer, hasActivePanel && styles.previewContainerSmall]}>
            <VideoPreview onVideoLoad={handleVideoLoad} />
          </View>

        </View>

        {/* Bottom Section - Tool Panel + Toolbar */}
        <View style={styles.bottomSection}>
          {/* Timeline */}
          <Timeline showTrimHandles={activeMode === 'trim'} />
         
          {/* Tool Panel (shown when a tool is active) */}
          {/* <ToolPanel activeMode={activeMode} /> */}

          {/* Bottom Toolbar */}
          <EditorToolbar />
        </View>

        {/* Export Modal */}
        <ExportModal
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  previewContainerSmall: {
    flex: 0.6,
  },
  bottomSection: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});

export default VideoEditorScreen;
