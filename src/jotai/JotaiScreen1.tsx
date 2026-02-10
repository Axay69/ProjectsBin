import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAtomValue } from 'jotai';
import { profileAtom, bioCharacterCountAtom } from './atoms';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function JotaiScreen1() {
    const profile = useAtomValue(profileAtom);
    const bioCount = useAtomValue(bioCharacterCountAtom);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { styles } = useStyles(stylesheet);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>Jotai Screen 1</Text>
                <Text style={styles.subHeader}>View Mode (Real-time Sync)</Text>

                <View style={[styles.card, { borderLeftColor: profile.themeColor }]}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{profile.name}</Text>

                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{profile.email}</Text>

                    <Text style={styles.label}>Bio ({bioCount} chars)</Text>
                    <Text style={styles.value}>{profile.bio}</Text>
                </View>

                <Pressable
                    style={[styles.button, { backgroundColor: profile.themeColor }]}
                    onPress={() => navigation.navigate('JotaiScreen2')}
                >
                    <Text style={styles.buttonText}>Go to Edit Screen</Text>
                </Pressable>

                <View style={styles.explanation}>
                    <Text style={styles.explanationTitle}>How Jotai works better than Redux here:</Text>
                    <Text style={styles.explanationText}>
                        1. **No Boilerplate**: No actions, reducers, or types needed to sync this state.{"\n"}
                        2. **Atomic**: Only components using `profileAtom` re-render.{"\n"}
                        3. **Simplicity**: We just defined an atom in one file and `useAtomValue` here.
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg },
    header: { fontSize: 28, fontWeight: '800', color: theme.colors.typography },
    subHeader: { fontSize: 16, color: theme.colors.subText, marginBottom: theme.spacing.xl },
    card: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 6,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        marginBottom: 24,
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    label: { fontSize: 12, fontWeight: '600', color: theme.colors.subText, textTransform: 'uppercase', letterSpacing: 1 },
    value: { fontSize: 18, color: theme.colors.typography, marginBottom: 16, fontWeight: '500' },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 32,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    explanation: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    explanationTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.accent, marginBottom: 8 },
    explanationText: { fontSize: 13, color: theme.colors.typography, lineHeight: 20 },
}));
