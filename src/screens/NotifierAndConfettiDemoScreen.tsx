import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { Confetti, ContinuousConfetti, ConfettiMethods } from 'react-native-fast-confetti';
import { Notifier, Easing, NotifierComponents } from 'react-native-notifier';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import { StatusBar } from 'react-native';

const NotifierAndConfettiDemoScreen = () => {
    const { styles, theme } = useStyles(stylesheet);
    const confettiRef = useRef<ConfettiMethods>(null);
    const continuousConfettiRef = useRef<ConfettiMethods>(null);
    const continuousConfettiRef2 = useRef<ConfettiMethods>(null);

    const isStartedRef = useRef(false);
    // Confetti Functions
    const triggerConfettiBlast = () => {
        confettiRef.current?.restart();
    };

    const toggleContinuousConfetti = () => {
        // We can't easily check 'running' state from ref without managing it externally or checking internal state if exposed.
        // For this demo, we'll just have start/stop buttons or toggle logic if we track state.
        // Let's just have explicit Start/Stop for continuous to be clear.
    };

    const startRain = () => {
        continuousConfettiRef.current?.resume();

        if (!isStartedRef.current) {
            setTimeout(() => {
                continuousConfettiRef2.current?.resume();
            }, 3000);
            isStartedRef.current = true;
        } else {
            continuousConfettiRef2.current?.resume();
        }

    }
    const stopRain = () => {
        continuousConfettiRef.current?.pause();
        continuousConfettiRef2.current?.pause();
    }


    // Notifier Functions
    const showSuccess = () => {
        Notifier.showNotification({
            title: 'Success!',
            description: 'This is a success notification with your theme colors.',
            Component: NotifierComponents.Alert,
            componentProps: {
                alertType: 'success',
                backgroundColor: theme.colors.success,
                // ContainerComponent: (props) => <View style={{ backgroundColor: theme.colors.success }}>
                //     {props.children}
                // </View>,
            },
            translucentStatusBar: true,
            showAnimationDuration: 800,
            showEasing: Easing.bounce,
        });
    };

    const showError = () => {
        Notifier.showNotification({
            title: 'Error Occurred',
            description: 'Something went wrong. Please try again.',
            Component: NotifierComponents.Alert,
            componentProps: {
                alertType: 'error',
            },
            translucentStatusBar: true,
        });
    };

    const showInfo = () => {
        Notifier.showNotification({
            title: 'Did you know?',
            description: 'You can swipe this notification up to dismiss it.',
            Component: NotifierComponents.Alert,
            componentProps: {
                alertType: 'info',
            },
            translucentStatusBar: true,
        });
    };

    const showCustom = () => {
        Notifier.showNotification({
            title: 'Custom Themed',
            description: 'This notification uses the current Unistyles theme!',
            duration: 3000,
            showAnimationDuration: 800,
            showEasing: Easing.bounce,
            onHidden: () => console.log('Hidden'),
            Component: NotifierComponents.Notification,
            componentProps: {
                imageSource: { uri: 'https://reactnative.dev/img/tiny_logo.png' },
                containerStyle: {
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                },
                titleStyle: {
                    color: theme.colors.typography,
                },
                descriptionStyle: {
                    color: theme.colors.subText,
                },
            },
            translucentStatusBar: true,
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Confetti Layers */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <Confetti ref={confettiRef} count={30} autoplay={false}
                // type="svg"
                // flakeSvg={require('../assets/images/money.svg')}
                // colors={['#0000']}
                />
                <ContinuousConfetti ref={continuousConfettiRef} count={30} autoplay={false} sizeVariation={1} />
                <ContinuousConfetti ref={continuousConfettiRef2} count={30} autoplay={false} sizeVariation={1} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>Notifier & Confetti</Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🎉 Fast Confetti</Text>

                    <TouchableOpacity style={[styles.button, styles.blastButton]} onPress={triggerConfettiBlast}>
                        <FontAwesomeIcon name="bomb" size={20} color="#FFF" style={styles.icon} />
                        <Text style={styles.buttonText}>Trigger Blast</Text>
                    </TouchableOpacity>

                    <View style={styles.row}>
                        <TouchableOpacity style={[styles.button, styles.rainButton]} onPress={startRain}>
                            <FontAwesomeIcon name="cloud-download" size={20} color="#FFF" style={styles.icon} />
                            <Text style={styles.buttonText}>Start Rain</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.button, styles.stopButton]} onPress={stopRain}>
                            <FontAwesomeIcon name="stop-circle" size={20} color="#FFF" style={styles.icon} />
                            <Text style={styles.buttonText}>Stop Rain</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🔔 Notifier</Text>

                    <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccess}>
                        <Text style={styles.buttonText}>Show Success</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showError}>
                        <Text style={styles.buttonText}>Show Error</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={showInfo}>
                        <Text style={styles.buttonText}>Show Info</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.button, styles.customButton]} onPress={showCustom}>
                        <Text style={styles.customButtonText}>Show Custom Themed</Text>
                    </TouchableOpacity>
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
    content: {
        padding: 20,
        gap: 30,
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.typography,
        marginBottom: 10,
    },
    section: {
        backgroundColor: theme.colors.surface + '80',
        borderRadius: 16,
        padding: 20,
        gap: 15,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 3,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 8,
    },
    blastButton: {
        backgroundColor: '#FFD700', // Gold
    },
    rainButton: {
        backgroundColor: '#3498db', // Blue
    },
    stopButton: {
        backgroundColor: '#95a5a6', // Gray
    },
    successButton: {
        backgroundColor: '#2ecc71',
    },
    errorButton: {
        backgroundColor: '#e74c3c',
    },
    infoButton: {
        backgroundColor: '#3498db',
    },
    customButton: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    customButtonText: {
        color: theme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    }
}));

export default NotifierAndConfettiDemoScreen;
