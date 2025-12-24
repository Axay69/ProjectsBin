import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { theme } from '../theme';

interface PlaylistCardProps {
  title: string;
  subtitle: string;
  image: string;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4;

export default function PlaylistCard({ title, subtitle, image, onPress }: PlaylistCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <FastImage
        source={{ uri: image }}
        style={styles.image}
        resizeMode={FastImage.resizeMode.cover}
      />
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    marginRight: theme.spacing.m,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.l,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH,
  },
  textContainer: {
    padding: theme.spacing.s,
  },
  title: {
    ...theme.typography.body,
    fontWeight: '600',
  },
  subtitle: {
    ...theme.typography.small,
    marginTop: 2,
  },
});
