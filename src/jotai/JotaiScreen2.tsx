import React from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useAtom } from 'jotai';
import { profileAtom } from './atoms';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function JotaiScreen2() {
    const [profile, setProfile] = useAtom(profileAtom);
    const { styles, theme } = useStyles(stylesheet);

    const updateProfile = (key: keyof typeof profile, value: string) => {
        setProfile((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Jotai Screen 2</Text>
                <Text style={styles.subHeader}>Edit Mode (Updates Global State)</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name</Text>
                    <TextInput
                        style={styles.input}
                        value={profile.name}
                        onChangeText={(val) => updateProfile('name', val)}
                        placeholder="Enter name"
                        placeholderTextColor={theme.colors.placeholder}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Bio</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={profile.bio}
                        onChangeText={(val) => updateProfile('bio', val)}
                        placeholder="Tell us about yourself"
                        placeholderTextColor={theme.colors.placeholder}
                        multiline
                        numberOfLines={4}
                    />
                </View>

                <Text style={styles.label}>Theme Color</Text>
                <View style={styles.colorPicker}>
                    {COLORS.map((color) => (
                        <Pressable
                            key={color}
                            style={[
                                styles.colorOption,
                                { backgroundColor: color },
                                profile.themeColor === color && styles.colorActive,
                            ]}
                            onPress={() => updateProfile('themeColor', color)}
                        />
                    ))}
                </View>

                <View style={styles.explanation}>
                    <Text style={styles.explanationTitle}>Why this is better:</Text>
                    <Text style={styles.explanationText}>
                        Notice how there's no complex "Dispatch" logic. We just use the `setProfile` function returned by `useAtom`, which works exactly like `useState`.
                        {"\n\n"}
                        When you type here, go back to Screen 1 and notice it's already updated without any extra wire-up.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg },
    header: { fontSize: 28, fontWeight: '800', color: theme.colors.typography },
    subHeader: { fontSize: 16, color: theme.colors.subText, marginBottom: theme.spacing.xl },
    inputGroup: { marginBottom: theme.spacing.lg },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.typography, marginBottom: 8 },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: theme.colors.typography,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    textArea: { height: 100, textAlignVertical: 'top' },
    colorPicker: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    colorOption: { width: 44, height: 44, borderRadius: 22 },
    colorActive: { borderWidth: 3, borderColor: theme.colors.typography },
    explanation: {
        backgroundColor: theme.colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    explanationTitle: { fontSize: 14, fontWeight: '700', color: theme.colors.accent, marginBottom: 8 },
    explanationText: { fontSize: 13, color: theme.colors.typography, lineHeight: 20 },
}));
