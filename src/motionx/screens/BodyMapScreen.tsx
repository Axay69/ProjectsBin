import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { Svg, Path, G } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { frontSvgRaw, backSvgRaw } from '../data/bodySvgs';
import { showToast } from '../lib/toast';

type BodyPart = {
  id: string;
  paths: string[];
};

function parseSvg(svg: string): { parts: BodyPart[], viewBox: string } {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 660 1206';

  const parts: BodyPart[] = [];
  // Regex to match <g> tags with id attribute anywhere in the tag
  const groupRegex = /<g[^>]*id="([^"]+)"[^>]*>(.*?)<\/g>/g;
  
  // Since the SVG string is flattened in our TS file (escaped newlines), . matches all if we didn't split it weirdly.
  // But wait, regex . does not match newlines usually.
  // Our setupBodySvgs.js joined the file content into a template literal.
  // If the original file had newlines inside groups, we need 's' flag.
  // But let's assume standard structure.

  let match;
  while ((match = groupRegex.exec(svg)) !== null) {
    const id = match[1];
    const content = match[2];
    const paths: string[] = [];

    const pathRegex = /\bd="([^"]+)"/g;
    let pathMatch;
    while ((pathMatch = pathRegex.exec(content)) !== null) {
      paths.push(pathMatch[1]);
    }

    if (paths.length > 0) {
      parts.push({ id, paths });
    }
  }

  // Sort parts so 'body' is first (rendered at bottom), others on top
  parts.sort((a, b) => {
    if (a.id === 'body') return -1;
    if (b.id === 'body') return 1;
    return 0;
  });

  console.log('parts', parts.map((part) => part.id));
  return { parts, viewBox };
}

import { useNavigation } from '@react-navigation/native';

export default function BodyMapScreen() {
  const navigation = useNavigation<any>();
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const { parts, viewBox } = useMemo(() => {
    return parseSvg(view === 'front' ? frontSvgRaw : backSvgRaw);
  }, [view]);

  const handlePress = (id: string) => {
    setSelectedPart(id);
    console.log('id', id);
    // showToast.success('Selected', id);
  };

  const handleGo = () => {
    if (selectedPart) {
      navigation.navigate('Wiki', { filterMuscle: selectedPart });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#1F2937', borderRadius: 12, padding: 4 }}>
          <TouchableOpacity
            onPress={() => setView('front')}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: view === 'front' ? '#0EA5A4' : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: view === 'front' ? '#0B0F14' : '#9CA3AF', fontWeight: '700' }}>Front</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView('back')}
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: view === 'back' ? '#0EA5A4' : 'transparent',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: view === 'back' ? '#0B0F14' : '#9CA3AF', fontWeight: '700' }}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Svg
          width={Dimensions.get('window').width * 0.9}
          height={Dimensions.get('window').height * 0.7}
          viewBox={viewBox}
        >
          {parts.map((part) => {
            return (
              <G key={part.id} onPress={() => {
                if (part.id === 'body') return;

                handlePress(part.id)
                }}>
                {part.paths.map((d, i) => (
                  <Path
                    key={i}
                    d={d}
                    fill={selectedPart === part.id ? '#0EA5A4' : '#374151'}
                    stroke="#1F2937"
                    strokeWidth="1"
                  />
                ))}
              </G>
            )

          })}
        </Svg>

        <View style={{ marginTop: 20, padding: 16, alignItems: 'center' }}>
          <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>Selected Muscle</Text>
          <Text style={{ color: '#F9FAFB', fontSize: 24, fontWeight: 'bold', textTransform: 'capitalize' }}>
            {selectedPart || 'None'}
          </Text>
          {selectedPart && (
            <TouchableOpacity 
              onPress={handleGo}
              style={{ marginTop: 16, backgroundColor: '#0EA5A4', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 24 }}
            >
              <Text style={{ color: '#0B0F14', fontWeight: 'bold', fontSize: 16 }}>GO</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
