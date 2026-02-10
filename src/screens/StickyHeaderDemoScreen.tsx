import React, { useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_FINAL_SIZE = 60;
const IMAGE_INITIAL_SIZE = 120;
const IMAGE_PADDING = 15;

const CollapsingHeader = ({
    scrollOffsetY,
    screenWidth,
}: {
    scrollOffsetY: Animated.Value;
    screenWidth: number;
}) => {
    const insets = useSafeAreaInsets();
    const { styles, theme } = useStyles(stylesheet);

    const headerExpandedHeight = screenWidth;
    const headerCollapsedHeight = IMAGE_FINAL_SIZE + insets.top + IMAGE_PADDING * 2;

    const animateContainerHeaderHeight = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [headerExpandedHeight, headerCollapsedHeight],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateTitleColor = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: ['#fff', theme.colors.typography],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateImageSize = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [IMAGE_INITIAL_SIZE, IMAGE_FINAL_SIZE],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateImageTop = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [IMAGE_PADDING * 4, insets.top + IMAGE_PADDING],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateImageLeft = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [screenWidth / 2 - IMAGE_INITIAL_SIZE / 2, IMAGE_PADDING],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateTextLeft = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [0, IMAGE_FINAL_SIZE + IMAGE_PADDING * 2],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateTitleTop = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [IMAGE_INITIAL_SIZE + IMAGE_PADDING * 6, insets.top + IMAGE_PADDING + 4],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateSubtitleTop = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [IMAGE_INITIAL_SIZE + IMAGE_PADDING * 8, insets.top + IMAGE_PADDING + 30],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateTitleFontSize = scrollOffsetY.interpolate({
        inputRange: [0, screenWidth * 0.8],
        outputRange: [24, 18],
        extrapolateLeft: 'extend',
        extrapolateRight: 'clamp',
    });

    const animateOpacity = scrollOffsetY.interpolate({
        inputRange: [screenWidth * 0.7, screenWidth * 0.8],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[
                styles.headerContainer,
                {
                    height: animateContainerHeaderHeight,
                },
            ]}>
            <Animated.View
                pointerEvents="box-none"
                style={[
                    styles.headerBlurContainer,
                    {
                        height: animateContainerHeaderHeight,
                        opacity: animateOpacity,
                    },
                ]}>
                <BlurView
                    style={styles.blurview}
                    blurType={theme.colors.background === '#ffffff' ? 'light' : 'dark'}
                    blurAmount={10}
                    reducedTransparencyFallbackColor={theme.colors.background}
                />
            </Animated.View>

            <Animated.Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop' }}
                style={[
                    styles.profileImage,
                    {
                        width: animateImageSize,
                        height: animateImageSize,
                        top: animateImageTop,
                        left: animateImageLeft,
                    },
                ]}
            />

            <Animated.Text
                style={[
                    styles.title,
                    {
                        color: animateTitleColor,
                        left: animateTextLeft,
                        top: animateTitleTop,
                        fontSize: animateTitleFontSize,
                        width: scrollOffsetY.interpolate({
                            inputRange: [0, screenWidth * 0.8],
                            outputRange: [screenWidth, screenWidth - (IMAGE_FINAL_SIZE + IMAGE_PADDING * 2)],
                            extrapolate: 'clamp',
                        }),
                        textAlign: 'center',
                    },
                ]}>
                Bill Boxley
            </Animated.Text>
            <Animated.Text
                style={[
                    styles.subtitle,
                    {
                        color: animateTitleColor,
                        left: animateTextLeft,
                        top: animateSubtitleTop,
                        width: scrollOffsetY.interpolate({
                            inputRange: [0, screenWidth * 0.8],
                            outputRange: [screenWidth, screenWidth - (IMAGE_FINAL_SIZE + IMAGE_PADDING * 2)],
                            extrapolate: 'clamp',
                        }),
                        textAlign: 'center',
                        opacity: scrollOffsetY.interpolate({
                            inputRange: [0, screenWidth * 0.4],
                            outputRange: [1, 0.7],
                            extrapolate: 'clamp'
                        }),
                    },
                ]}>
                Senior Software Engineer
            </Animated.Text>
        </Animated.View>
    );
};

const StickyHeaderDemoScreen = () => {
    const scrollOffsetY = useRef(new Animated.Value(0)).current;
    const { styles, theme } = useStyles(stylesheet);

    return (
        <View style={styles.container}>
            <StatusBar barStyle={theme.colors.background === '#ffffff' ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />
            <ScrollView
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollOffsetY } } }],
                    { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: screenWidth }}>
                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.text}>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Text>
                    <Text style={styles.text}>
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                    </Text>
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Experience</Text>
                        <Text style={styles.cardText}>• Lead Developer at TechCorp (2020 - Present)</Text>
                        <Text style={styles.cardText}>• Senior Engineer at SoftSys (2018 - 2020)</Text>
                        <Text style={styles.cardText}>• Web Developer at StartUp Inc (2015 - 2018)</Text>
                    </View>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <Text style={styles.text}>
                        ReactNative, Animations, UI/UX Design, Open Source Contribution, Coffee, and Hiking.
                    </Text>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1000&auto=format&fit=crop' }}
                        style={styles.contentImage}
                    />
                    <Text style={styles.text}>
                        Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam. Maecenas fermentum consequat mi. Donec fermentum. Pellentesque malesuada nulla a mi. Duis sapien sem, aliquet nec, commodo eget, consequat quis, neque. Aliquam faucibus, elit ut dictum aliquet, felis nisl adipiscing sapien, sed malesuada diam lacus eget erat. Cras mollis scelerisque nunc. Nullam arcu. Aliquam consequat. Curabitur augue lorem, dapibus quis, laoreet et, pretium ac, nisi. Aenean magna nisl, mollis quis, molestie eu, feugiat in, orci. In hac habitasse platea dictumst.
                    </Text>
                    <View style={{ height: 100 }} />
                </View>
            </ScrollView>
            <CollapsingHeader
                scrollOffsetY={scrollOffsetY}
                screenWidth={screenWidth}
            />
        </View>
    );
};

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        overflow: 'hidden',
        backgroundColor: theme.colors.primary,
    },
    headerBlurContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: theme.colors.background,
    },
    blurview: {
        ...StyleSheet.absoluteFillObject,
    },
    profileImage: {
        position: 'absolute',
        borderRadius: 100,
        borderWidth: 3,
        borderColor: '#fff',
    },
    title: {
        position: 'absolute',
        fontWeight: '800',
    },
    subtitle: {
        position: 'absolute',
        fontSize: 14,
        fontWeight: '500',
    },
    content: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 20,
        marginBottom: 10,
        color: theme.colors.typography,
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
        color: theme.colors.subText,
        marginBottom: 15,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        color: theme.colors.typography,
    },
    cardText: {
        fontSize: 15,
        color: theme.colors.typography,
        marginBottom: 4,
    },
    contentImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginVertical: 20,
    }
}));

export default StickyHeaderDemoScreen;
