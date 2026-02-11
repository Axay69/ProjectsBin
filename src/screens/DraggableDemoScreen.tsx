import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import DraggableView from 'react-native-draggable-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function DraggableDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);
    const [isUp, setIsUp] = useState(false);

    const renderContainerView = () => (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Draggable View</Text>
                <Text style={styles.subtitle}>react-native-draggable-view</Text>
            </View>

            <View style={styles.mainContent}>
                <Icon name="gesture-swipe-up" size={80} color={theme.colors.primary} />
                <Text style={styles.infoTitle}>Vertical Drawer Experience</Text>
                <Text style={styles.infoText}>
                    This library provides a simple way to implement vertical drawers that can be dragged up or down.
                </Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Drawer is currenty {isUp ? 'OPEN' : 'CLOSED'}</Text>
                </View>
            </View>
        </SafeAreaView>
    );

    const renderInitDrawerView = () => (
        <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
            <Text style={styles.handleText}>Drag me up!</Text>
        </View>
    );

    const renderDrawerView = () => (
        <View style={styles.drawerContent}>
            <Text style={styles.drawerTitle}>Drawer Content</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                {[1, 2, 3, 4, 5].map((item) => (
                    <View key={item} style={styles.listItem}>
                        <Icon name="check-circle-outline" size={24} color={theme.colors.accent} />
                        <View style={styles.listItemTextContainer}>
                            <Text style={styles.listItemTitle}>Feature Point {item}</Text>
                            <Text style={styles.listItemSubtitle}>Detailed explanation of this awesome feature.</Text>
                        </View>
                    </View>
                ))}
                <TouchableOpacity style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>Action Button</Text>
                </TouchableOpacity>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );

    return (
        <DraggableView
            initialDrawerSize={0.2}
            renderContainerView={renderContainerView}
            renderDrawerView={renderDrawerView}
            renderInitDrawerView={renderInitDrawerView}
            onRelease={(isGoingUp) => setIsUp(isGoingUp)}
            drawerBg={theme.colors.surface}
            finalDrawerHeight={200}
        />
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: theme.colors.typography,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.subText,
        marginTop: 4,
    },
    mainContent: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: theme.spacing.xl,
    },
    infoTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme.colors.typography,
        marginTop: 24,
        textAlign: 'center',
    },
    infoText: {
        fontSize: 16,
        color: theme.colors.subText,
        textAlign: 'center',
        marginTop: 12,
        lineHeight: 24,
    },
    statusBadge: {
        marginTop: 32,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.primary,
    },
    handleContainer: {
        height: 80,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: theme.colors.border,
        borderRadius: 3,
        marginBottom: 8,
    },
    handleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.subText,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    drawerContent: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    drawerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: theme.colors.typography,
        marginBottom: 20,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    listItemTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.colors.typography,
    },
    listItemSubtitle: {
        fontSize: 14,
        color: theme.colors.subText,
        marginTop: 2,
    },
    closeButton: {
        backgroundColor: theme.colors.primary,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
}));
