import React from 'react';
import {
    View,
    Text,
    Dimensions,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    interpolate,
    Extrapolation,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_COLS = 4;
const GRID_ROWS = 5;
const ICONS_PER_PAGE = GRID_COLS * GRID_ROWS;
const NUM_PAGES = 5;

// Generate random icons
const ICON_NAMES = [
    'android', 'application', 'apps', 'archive', 'arrow-all', 'assistant',
    'battery', 'bell', 'bluetooth', 'book', 'bookmark', 'briefcase',
    'bug', 'calculator', 'calendar', 'camera', 'cart', 'cast',
    'chart-arc', 'check', 'clock', 'cloud', 'cog', 'compass',
    'contacts', 'credit-card', 'crop', 'dashboard', 'database', 'delete',
    'diamond', 'disk', 'download', 'dropbox', 'email', 'eye',
    'facebook', 'file', 'film', 'filter', 'fire', 'flag',
    'flash', 'flask', 'folder', 'gamepad', 'gift', 'github',
    'google', 'grid', 'heart', 'home', 'image', 'inbox',
    'instagram', 'key', 'layers', 'lightbulb', 'link', 'lock',
    'login', 'logout', 'map', 'message', 'microphone', 'minus',
    'monitor', 'music', 'navigation', 'network', 'notification-clear-all',
    'palette', 'paperclip', 'pause', 'phone', 'pin', 'play',
    'plus', 'power', 'printer', 'puzzle', 'radio', 'recycle',
    'refresh', 'rocket', 'rss', 'save', 'search', 'send',
    'settings', 'share', 'shield', 'shopping', 'shuffle', 'signal',
    'sitemap', 'skull', 'sleep', 'snapchat', 'snowflake', 'sort',
    'sound', 'source-branch', 'star', 'stop', 'tag', 'television',
    'thumb-up', 'thumbs-up-down', 'ticket', 'timer', 'tools', 'tooltip',
    'trophy', 'truck', 'twitter', 'umbrella', 'upload', 'user',
    'video', 'view-grid', 'volume-high', 'wallet', 'watch', 'water',
    'weather-sunny', 'web', 'wifi', 'window-maximize', 'wrench', 'youtube'
];

const getRandomIcon = () => ICON_NAMES[Math.floor(Math.random() * ICON_NAMES.length)];
const getRandomColor = () => {
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
    return colors[Math.floor(Math.random() * colors.length)];
};

type AppIcon = {
    id: string;
    name: string;
    icon: string;
    color: string;
};

const generatePageData = (pageIndex: number): (AppIcon | null)[] => {
    // Randomly fill slots, but ensure we have 10-20 icons as requested
    const numIcons = Math.floor(Math.random() * 11) + 10; // 10 to 20
    const slots = Array(ICONS_PER_PAGE).fill(null);

    const filledIndices = new Set<number>();
    while (filledIndices.size < numIcons) {
        const idx = Math.floor(Math.random() * ICONS_PER_PAGE);
        if (!filledIndices.has(idx)) {
            filledIndices.add(idx);
            slots[idx] = {
                id: `p${pageIndex}-i${idx}`,
                name: `App ${idx + 1}`,
                icon: getRandomIcon(),
                color: getRandomColor(),
            };
        }
    }
    return slots;
};

const PAGES_DATA = Array.from({ length: NUM_PAGES }).map((_, i) => generatePageData(i));

export default function AndroidHomeDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);
    const scrollX = useSharedValue(0);
    const scale = useSharedValue(1);
    const [isEditing, setIsEditing] = React.useState(false);
    const [transitionType, setTransitionType] = React.useState<'Simple' | 'Cube' | 'Round'>('Simple');
    const insets = useSafeAreaInsets();

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            scrollX.value = event.contentOffset.x;
        },
    });

    const pinch = Gesture.Pinch()
        .onUpdate((e) => {
            if (!isEditing) {
                // Allow zooming out
                scale.value = Math.max(0.6, Math.min(e.scale, 1));
            }
        })
        .onEnd(() => {
            if (scale.value < 0.85) {
                scale.value = withSpring(0.7);
                runOnJS(setIsEditing)(true);
            } else {
                scale.value = withSpring(1);
                runOnJS(setIsEditing)(false);
            }
        });

    const animatedSceneStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        borderRadius: interpolate(scale.value, [0.7, 1], [20, 0]),
        overflow: 'hidden',
    }));

    const animatedSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withTiming(isEditing ? 0 : 300),
                },
            ],
            opacity: withTiming(isEditing ? 1 : 0),
        };
    });

    const finishEditing = () => {
        scale.value = withSpring(1);
        setIsEditing(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="black" translucent />

            {/* Background Wallpaper - Static (doesn't zoom) */}
            <View style={StyleSheet.absoluteFillObject}>
                <View style={{ flex: 1, backgroundColor: '#1a2a6c' }} />
                <View style={{ flex: 1, backgroundColor: '#b21f1f' }} />
                <View style={{ flex: 1, backgroundColor: '#fdbb2d' }} />
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
            </View>

            {/* Dock Area - Static (doesn't zoom) */}
            <View style={[styles.dock, { bottom: insets.bottom + 10 }]}>
                {['phone', 'message', 'apps', 'chrome', 'camera'].map((icon, idx) => (
                    <TouchableOpacity key={idx} style={styles.dockIcon} disabled={isEditing}>
                        <Icon name={icon} size={30} color="white" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Content Area that Zooms */}
            <GestureDetector gesture={pinch}>
                <Animated.View style={[
                    styles.contentContainer,
                    animatedSceneStyle,
                    isEditing && styles.zoomedActive
                ]}>
                    <Animated.ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={scrollHandler}
                        scrollEventThrottle={16}
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        scrollEnabled={!isEditing}
                    >
                        {PAGES_DATA.map((pageIcons, pageIndex) => {
                            return (
                                <View key={pageIndex} style={styles.pageContainer}>
                                    <View style={styles.gridContainer}>
                                        {pageIcons.map((item, index) => {
                                            if (!item) {
                                                return <View key={`empty-${index}`} style={styles.iconContainer} />;
                                            }
                                            return (
                                                <TouchableOpacity key={item.id} style={styles.iconContainer} disabled={isEditing}>
                                                    <View style={[styles.iconCircle, { backgroundColor: item.color + 'AA' }]}>
                                                        <Icon name={item.icon} size={32} color="white" />
                                                    </View>
                                                    <Text style={styles.iconLabel} numberOfLines={1}>{item.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            );
                        })}
                    </Animated.ScrollView>

                    {/* Page Inidicator - Inside Zoom region */}
                    <View style={[styles.pagination]}>
                        {PAGES_DATA.map((_, index) => {
                            const animatedDotStyle = useAnimatedStyle(() => {
                                const opacity = interpolate(
                                    scrollX.value,
                                    [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                                    [0.4, 1, 0.4],
                                    Extrapolation.CLAMP
                                );
                                const scale = interpolate(
                                    scrollX.value,
                                    [(index - 1) * SCREEN_WIDTH, index * SCREEN_WIDTH, (index + 1) * SCREEN_WIDTH],
                                    [0.8, 1.2, 0.8],
                                    Extrapolation.CLAMP
                                );
                                return { opacity, transform: [{ scale }] };
                            });

                            return (
                                <Animated.View key={index} style={[styles.dot, animatedDotStyle]} />
                            );
                        })}
                    </View>
                </Animated.View>
            </GestureDetector>

            {/* Edit Sheet */}
            <Animated.View style={[styles.editSheet, { paddingBottom: insets.bottom + 20 }, animatedSheetStyle]}>
                <Text style={styles.sheetTitle}>Transition Effect</Text>
                <View style={styles.sheetButtons}>
                    {(['Simple', 'Cube', 'Round'] as const).map((type) => (
                        <TouchableOpacity
                            key={type}
                            style={[
                                styles.sheetButton,
                                transitionType === type && styles.sheetButtonActive
                            ]}
                            onPress={() => setTransitionType(type)}
                        >
                            <Text style={[
                                styles.sheetButtonText,
                                transitionType === type && styles.sheetButtonTextActive
                            ]}>{type}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.doneButton} onPress={finishEditing}>
                    <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
            </Animated.View>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    contentContainer: {
        flex: 1,
        marginBottom: 100, // Leave space for dock
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
    },
    pageContainer: {
        width: SCREEN_WIDTH,
        height: '100%',
        paddingHorizontal: 16,
        paddingTop: 60,
    },
    gridContainer: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    iconContainer: {
        width: (SCREEN_WIDTH - 32) / GRID_COLS,
        height: Dimensions.get('window').height * 0.12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    iconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    iconLabel: {
        color: 'white',
        fontSize: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        textAlign: 'center',
        width: '100%',
    },
    pagination: {
        position: 'absolute',
        bottom: 20, // Relative to content container, above the "bottom" of it
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 20,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'white',
        marginHorizontal: 4,
    },
    dock: {
        position: 'absolute',
        left: 16,
        right: 16,
        height: 70,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
        zIndex: 0, // Behind edit sheet but static
    },
    dockIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
    },
    zoomedActive: {
        borderColor: 'rgba(255,255,255,0.3)',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)', // Dim the content slightly
    },
    editSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1E1E1E',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 20,
        zIndex: 100,
    },
    sheetTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    sheetButtons: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20,
    },
    sheetButton: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
    },
    sheetButtonActive: {
        backgroundColor: '#4CAF50',
        borderColor: '#4CAF50',
    },
    sheetButtonText: {
        color: '#AAA',
        fontWeight: '600',
    },
    sheetButtonTextActive: {
        color: 'white',
    },
    doneButton: {
        width: '100%',
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#2196F3',
        borderRadius: 12,
    },
    doneButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
}));
