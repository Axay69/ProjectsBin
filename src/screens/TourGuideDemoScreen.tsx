import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import {
    TourGuideProvider,
    TourGuideZone,
    useTourGuideController,
    TourGuideZoneByPosition,
    Tooltip
} from 'rn-tourguide';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const TourGuideContent = () => {
    const { styles, theme } = useStyles(stylesheet);
    const { canStart, start, stop, eventEmitter } = useTourGuideController();

    useEffect(() => {
        if (canStart) {
            // console.log('Tour Guide can start!');
        }
    }, [canStart]);

    const handleStart = () => {
        if (canStart) {
            start();
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <TourGuideZone
                    zone={1}
                    text="Welcome to the Tour Guide Demo! This is the header."
                    shape='rectangle'
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Tour Guide Demo</Text>
                        <FontAwesomeIcon name="map-signs" size={30} color={theme.colors.primary} />
                    </View>
                </TourGuideZone>

                <View style={styles.card}>
                    <TourGuideZone
                        zone={5}
                        shape="rectangle"
                        text="This is an image component. You can highlight any UI element."
                    >
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    </TourGuideZone>
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>Beautiful Landscapes</Text>
                        <Text style={styles.cardText}>
                            Explore the world with our new travel app features.
                        </Text>
                    </View>
                </View>

                <View style={styles.actions}>
                    <TourGuideZone
                        zone={3}
                        shape="circle"
                        text="Click here to like this post!"
                    >
                        <TouchableOpacity style={styles.actionButton}>
                            <FontAwesomeIcon name="heart" size={24} color="#e74c3c" />
                        </TouchableOpacity>
                    </TourGuideZone>

                    <TourGuideZone
                        zone={4}
                        text="Share this with your friends."
                    >
                        <TouchableOpacity style={styles.actionButton}>
                            <FontAwesomeIcon name="share-alt" size={24} color="#3498db" />
                        </TouchableOpacity>
                    </TourGuideZone>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                        <Text style={styles.startButtonText}>Start Tour Again</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const TourGuideDemoScreen = () => {
    const { theme } = useStyles(stylesheet);

    return (
        <TourGuideProvider
            androidStatusBarVisible={true}
            backdropColor="rgba(0, 0, 0, 0.7)"
            tooltipStyle={{ backgroundColor: theme.colors.surface, borderRadius: 12, padding: 15 }}
            labels={{
                previous: 'Back',
                next: 'Next',
                skip: 'Skip',
                finish: 'Finish',
            }}
        >
            <TourGuideContent />
        </TourGuideProvider>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    image: {
        width: '100%',
        height: 200,
    },
    cardContent: {
        padding: 15,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: 5,
    },
    cardText: {
        fontSize: 14,
        color: theme.colors.subText || '#666',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 30,
        marginTop: 10,
    },
    actionButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
    },
    startButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
    },
    startButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
}));

export default TourGuideDemoScreen;
