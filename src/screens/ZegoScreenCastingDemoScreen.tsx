import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/*
import {
  ZegoUIKitPrebuiltCall,
  GROUP_VIDEO_CALL_CONFIG,
  ZegoMenuBarButtonName
} from '@zegocloud/zego-uikit-prebuilt-call-rn';
*/

export default function ZegoScreenCastingDemoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Zego Screen Casting Demo Screen (Disabled)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#666',
  },
});

