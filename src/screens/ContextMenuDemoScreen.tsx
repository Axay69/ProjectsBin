import React from 'react';
import { View, Text, ScrollView, Alert, Image } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function ContextMenuDemoScreen() {
    const { styles } = useStyles(stylesheet);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Context Menu View</Text>
                <Text style={styles.subHeader}>Native Long-Press Menus</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. Simple Action Menu</Text>
                    <ContextMenu
                        actions={[
                            { title: 'Copy Text', systemIcon: 'doc.on.doc' },
                            { title: 'Share', systemIcon: 'square.and.arrow.up' },
                            { title: 'Delete', destructive: true, systemIcon: 'trash' },
                        ]}
                        onPress={(e) => {
                            Alert.alert('Action Selected', `You clicked: ${e.nativeEvent.name}`);
                        }}
                    >
                        <View style={styles.targetBox}>
                            <Text style={styles.targetText}>Long Press Me</Text>
                        </View>
                    </ContextMenu>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. Image Context Menu</Text>
                    <ContextMenu
                        title="Image Options"
                        actions={[
                            { title: 'Save to Gallery', systemIcon: 'square.and.arrow.down' },
                            { title: 'Edit Image', systemIcon: 'pencil' },
                        ]}
                        onPress={(e) => {
                            Alert.alert('Image Action', e.nativeEvent.name);
                        }}
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600&auto=format&fit=crop' }}
                            style={styles.image}
                        />
                    </ContextMenu>
                </View>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>Why native context menus?</Text>
                    <Text style={styles.infoText}>
                        1. **iOS Haptics**: Automatically provides the system-standard haptic feedback on iOS.{"\n"}
                        2. **Android Standards**: Uses native Android context menus which users are familiar with.{"\n"}
                        3. **Accessibility**: Native menus are better supported by screen readers.{"\n"}
                        4. **Clean UI**: Menus overlay the content without shifting the layout.
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
    subHeader: { fontSize: 16, color: theme.colors.subText, marginBottom: 32 },
    section: { marginBottom: 32 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.typography, marginBottom: 12 },
    targetBox: {
        backgroundColor: theme.colors.primary,
        height: 120,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    targetText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 16,
    },
    info: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.accent, marginBottom: 8 },
    infoText: { fontSize: 14, color: theme.colors.typography, lineHeight: 22 },
}));
