import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
    TourGuideProvider,
    TourGuideZone,
    useTourGuideController,
    TooltipProps,
} from 'rn-tourguide';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

// Custom Tooltip Component
const CustomTooltip = ({
    isFirstStep,
    isLastStep,
    handleNext,
    handlePrev,
    handleStop,
    currentStep,
    labels,
}: TooltipProps) => {
    const { styles, theme } = useStyles(stylesheet);

    return (
        <Animated.View style={styles.tooltipContainer}>
            <View style={styles.tooltipHeader}>
                <FontAwesomeIcon name="info-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.tooltipTitle}>Step {currentStep ? currentStep.order : 0}</Text>
            </View>

            <Text style={styles.tooltipText}>{currentStep ? currentStep.text : ''}</Text>

            <View style={styles.tooltipFooter}>
                {!isFirstStep && (
                    <TouchableOpacity onPress={handlePrev} style={styles.tooltipButton}>
                        <Text style={styles.tooltipButtonText}>{labels?.previous || 'Back'}</Text>
                    </TouchableOpacity>
                )}

                {!isLastStep ? (
                    <TouchableOpacity onPress={handleNext} style={[styles.tooltipButton, styles.tooltipButtonPrimary]}>
                        <Text style={[styles.tooltipButtonText, styles.tooltipButtonTextPrimary]}>{labels?.next || 'Next'}</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleStop} style={[styles.tooltipButton, styles.tooltipButtonPrimary]}>
                        <Text style={[styles.tooltipButtonText, styles.tooltipButtonTextPrimary]}>{labels?.finish || 'Finish'}</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={handleStop} style={styles.skipButton}>
                    <Text style={styles.skipButtonText}>{labels?.skip || 'Skip'}</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const CustomTourGuideContent = () => {
    const { styles, theme } = useStyles(stylesheet);
    const { canStart, start, stop, eventEmitter, } = useTourGuideController();

    React.useEffect(() => {
        if (canStart) {
            start();
            setTimeout(() => start(), 100);
        }
    }, [canStart]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TourGuideZone
                    zone={1}
                    text="This uses a CUSTOM tooltip component!"
                    borderRadius={10}
                >
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Custom Tour Guide</Text>
                        <FontAwesomeIcon name="magic" size={24} color={theme.colors.primary} />
                    </View>
                </TourGuideZone>

                <View style={styles.card}>
                    <TourGuideZone
                        zone={2}
                        text="We also use a custom backdrop color here."
                        shape="rectangle"
                    >
                        <View style={styles.placeholderBox}>
                            <Text style={styles.placeholderText}>Feature Area</Text>
                        </View>
                    </TourGuideZone>
                </View>

                <View style={styles.footer}>
                    <TourGuideZone
                        zone={3}
                        text="You can reset the tour here."
                        shape="circle"
                    >
                        <TouchableOpacity style={styles.refreshButton} onPress={() => start()}>
                            <FontAwesomeIcon name="refresh" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </TourGuideZone>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const TourGuideCustomDemoScreen = () => {
    return (
        <TourGuideProvider
            {...{
                tooltipComponent: CustomTooltip,
                backdropColor: 'rgba(50, 0, 100, 0.8)', // Custom purple backdrop
                androidStatusBarVisible: true,
                dismissOnPress: true,
                labels: {
                    previous: 'PREV',
                    next: 'NEXT',
                    skip: 'EXIT',
                    finish: 'DONE',
                },
                tooltipStyle: {
                    // backgroundColor: 'red'
                }
                // startAtMount: true,

            }}
        >
            <CustomTourGuideContent />
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
        gap: 40,
    },
    header: {
        padding: 20,
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.typography,
    },
    card: {
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
    },
    placeholderBox: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
        borderStyle: 'dashed',
        borderRadius: 16,
    },
    placeholderText: {
        color: theme.colors.primary,
        fontSize: 18,
        fontWeight: '500',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
    },
    refreshButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 6,
    },
    // Tooltip Styles
    tooltipContainer: {
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        padding: 16,
        width: 250,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    tooltipHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 8,
    },
    tooltipTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.primary,
    },
    tooltipText: {
        fontSize: 14,
        color: theme.colors.typography,
        marginBottom: 16,
        lineHeight: 20,
    },
    tooltipFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 8,
    },
    tooltipButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    tooltipButtonPrimary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    tooltipButtonText: {
        fontSize: 12,
        color: theme.colors.typography,
        fontWeight: '600',
    },
    tooltipButtonTextPrimary: {
        color: '#FFF',
    },
    skipButton: {
        marginLeft: 8,
    },
    skipButtonText: {
        fontSize: 12,
        color: theme.colors.subText || '#999',
        textDecorationLine: 'underline',
    },
}));

export default TourGuideCustomDemoScreen;
