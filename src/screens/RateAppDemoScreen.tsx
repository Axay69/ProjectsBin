import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import RateApp from 'react-native-rate-app';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const RateAppDemoScreen = () => {
    const { styles, theme } = useStyles(stylesheet);
    const [lastResult, setLastResult] = useState<string>('');

    const handleRequestReview = async () => {
        try {
            const result = await RateApp.requestReview();
            const message = result
                ? '✅ Review requested successfully!'
                : '❌ Review request failed or quota reached';
            setLastResult(message);
            console.log('Request Review Result:', result);
        } catch (error) {
            const errorMessage = `❌ Error: ${error}`;
            setLastResult(errorMessage);
            console.error('Request Review Error:', error);
        }
    };

    const handleOpenStore = async () => {
        try {
            const result = await RateApp.openStoreForReview({
                iOSAppId: '1234567890', // Replace with your actual App Store ID
                androidPackageName: 'com.projectsbin', // Replace with your actual package name
            });
            const message = result
                ? '✅ Store opened successfully!'
                : '❌ Failed to open store';
            setLastResult(message);
            console.log('Open Store Result:', result);
        } catch (error) {
            const errorMessage = `❌ Error: ${error}`;
            setLastResult(errorMessage);
            console.error('Open Store Error:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <FontAwesomeIcon name="star" size={40} color={theme.colors.primary} />
                    <Text style={styles.title}>Rate App Demo</Text>
                    <Text style={styles.subtitle}>
                        Test in-app review and store redirect functionality
                    </Text>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesomeIcon name="star-half-o" size={24} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Request In-App Review</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                        Shows the native review dialog. Note: In dev mode, this always appears.
                        In production, it respects OS quotas.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={handleRequestReview}>
                        <FontAwesomeIcon name="thumbs-up" size={20} color="#FFF" />
                        <Text style={styles.buttonText}>Request Review</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <FontAwesomeIcon name="external-link" size={24} color={theme.colors.primary} />
                        <Text style={styles.cardTitle}>Open App Store</Text>
                    </View>
                    <Text style={styles.cardDescription}>
                        Opens the app's page in the App Store (iOS) or Play Store (Android) for reviews.
                    </Text>
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSecondary]}
                        onPress={handleOpenStore}
                    >
                        <FontAwesomeIcon name="shopping-cart" size={20} color={theme.colors.primary} />
                        <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
                            Open Store
                        </Text>
                    </TouchableOpacity>
                </View>

                {lastResult ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>Last Result:</Text>
                        <Text style={styles.resultText}>{lastResult}</Text>
                    </View>
                ) : null}

                <View style={styles.infoCard}>
                    <FontAwesomeIcon name="info-circle" size={20} color={theme.colors.primary} />
                    <Text style={styles.infoText}>
                        <Text style={styles.infoBold}>Note: </Text>
                        The review dialog may not appear due to OS rate limits. Check console for results.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: 20,
        gap: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginTop: 10,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.subText || '#666',
        textAlign: 'center',
        marginTop: 5,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    cardDescription: {
        fontSize: 14,
        color: theme.colors.subText || '#666',
        lineHeight: 20,
        marginBottom: 15,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        backgroundColor: theme.colors.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
    },
    buttonSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },
    buttonTextSecondary: {
        color: theme.colors.primary,
    },
    resultCard: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    resultTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: 5,
    },
    resultText: {
        fontSize: 14,
        color: theme.colors.typography,
    },
    infoCard: {
        flexDirection: 'row',
        gap: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: theme.colors.subText || '#666',
        lineHeight: 18,
    },
    infoBold: {
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
}));

export default RateAppDemoScreen;
