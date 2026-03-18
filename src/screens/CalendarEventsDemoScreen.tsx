import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    StatusBar,
    Alert,
    FlatList,
    Modal,
    TextInput,
    Platform,
    Linking,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    AppState,
    RefreshControl
} from 'react-native'
import { useCallback } from 'react'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { useNavigation, useFocusEffect } from '@react-navigation/native'

interface Booking {
    id: number
    provider_email: string
    customer_email: string
    service_name: string
    start_time: string
    end_time: string
    provider_event_id: string
    customer_event_id: string
    status: 'pending' | 'accept' | 'decline' | 'cancel'
    created_at: string
    updated_at: string
    link?: string
}

export default function CalendarEventsDemoScreen() {
    const { styles, theme } = useStyles(stylesheet)
    const { providerEmail, setProviderEmail, logout } = useAuthStore()
    const navigation = useNavigation<any>()

    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(false)
    const [uniqueToken, setUniqueToken] = useState<string | null>(null)

    const API_BASE = 'https://87d5-2405-201-200c-90ad-753e-be2e-6bea-42f5.ngrok-free.app'

    useFocusEffect(
        useCallback(() => {
            if (providerEmail) {
                fetchBookings();
            }
        }, [providerEmail])
    );

    const fetchBookings = async () => {
        if (!providerEmail) return;
        setLoading(true);
        try {
            console.log('[Booking] Fetching list for:', providerEmail);
            const response = await axios.get(`${API_BASE}/api/bookings/user/${providerEmail}`);
            if (response.data.success) {
                console.log('response.data.success', response.data.bookings);

                setBookings(response.data.bookings.filter((booking: Booking) => booking.status !== 'cancel'));
            }
        } catch (error) {
            console.error('[Booking] Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Setup deep link listener for login callback
        const handleDeepLink = (event: { url: string }) => {
            console.log('[OutlookLogin] Received callback URL:', event.url);
            if (event.url.includes('auth/outlook/callback')) {
                // Alert.alert('Login Callback', `Received response: ${event.url}`);
                console.log('[OutlookLogin] Deep link callback received, checking token...');
                checkAuthToken();
            }
        };

        const subscription = Linking.addEventListener('url', handleDeepLink);

        // AppState listener for refocus detection
        const appStateSubscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                console.log('[OutlookLogin] App refocused, checking token if available...');
                checkAuthToken();
            }
        });

        // Check for initial URL if app was closed
        Linking.getInitialURL().then(url => {
            if (url) {
                console.log('[OutlookLogin] Initial URL:', url);
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
            appStateSubscription.remove();
        };
    }, [uniqueToken]) // Re-run effect or ensure checkAuthToken uses latest uniqueToken

    const checkAuthToken = async () => {
        if (!uniqueToken) return;

        try {
            console.log('[OutlookLogin] Checking token for:', uniqueToken);
            const response = await axios.get(`${API_BASE}/auth/outlook/token/${uniqueToken}`);
            console.log('[OutlookLogin] Token response:', JSON.stringify(response.data, null, 2));

            if (response.data.success) {
                const userEmail = response.data.data.email;
                Alert.alert('Login Successful', `Welcome, ${userEmail}!`);
                setProviderEmail(userEmail);
                setUniqueToken(null);
                // fetchBookings will be triggered by useEffect
            }
        } catch (error) {
            console.error('[OutlookLogin] Error checking token:', error);
        }
    };

    const handleOutlookLogin = async () => {
        setLoading(true);
        try {
            console.log('[OutlookLogin] Fetching auth URL...');
            const response = await axios.get(`${API_BASE}/auth/outlook/url`);
            const { unique_token, link } = response.data;
            setUniqueToken(unique_token);
            Linking.openURL(link).catch(err => console.error('[OutlookLogin] Error:', err));
        } catch (error) {
            console.error('[OutlookLogin] Error:', error);
            Alert.alert('Error', 'Failed to initiate login flow.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        navigation.navigate('BookingDetail');
    };

    const handleOpenEdit = (booking: Booking) => {
        navigation.navigate('BookingDetail', { booking });
    };

    const handleDeleteBooking = async (id: string, customerEmail: string) => {
        if (!providerEmail) return;

        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                        setLoading(true);
                        try {
                            console.log(`[Booking] Cancelling ${id}`);
                            await axios.delete(`${API_BASE}/api/bookings/${id}`, {
                                data: {
                                    customerEmail: customerEmail
                                }
                            });
                            Alert.alert('Success', 'Booking Deleted.');
                            fetchBookings(); // Refresh live data
                        } catch (error) {
                            console.error('[Booking] Delete Error:', error);
                            Alert.alert('Error', 'Failed to cancel booking.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };



    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Booking Dashboard</Text>
                    {providerEmail && (
                        <Text style={styles.headerSubtitle}>{providerEmail}</Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    {providerEmail ? (
                        <Pressable style={styles.logoutButton} onPress={logout}>
                            <MaterialCommunityIcons name="logout" size={20} color="#ff5f56" />
                        </Pressable>
                    ) : (
                        <View style={styles.permissionBadge}>
                            <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
                            <Text style={styles.permissionText}>UNAUTHORIZED</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.content}>
                {/* Actions Section */}
                {!providerEmail && (
                    <View style={[styles.section, { marginBottom: 30 }]}>
                        <Text style={styles.sectionLabel}>AUTHENTICATION</Text>
                        <View style={styles.actionGrid}>
                            <Pressable
                                style={styles.actionCard}
                                onPress={handleOutlookLogin}
                                disabled={loading}
                            >
                                <View style={[styles.iconBg, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                                    <MaterialCommunityIcons name="microsoft-outlook" size={24} color="#22c55e" />
                                </View>
                                <Text style={styles.actionTitle}>Outlook Login</Text>
                                <Text style={styles.actionDesc}>{loading ? 'Redirecting...' : 'Required for Booking'}</Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Bookings List */}
                <View style={[styles.section, { flex: 1 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>YOUR BOOKINGS</Text>
                        <Pressable onPress={handleOpenCreate} disabled={!providerEmail}>
                            <MaterialCommunityIcons
                                name="plus-circle"
                                size={28}
                                color={!providerEmail ? '#475569' : '#60a5fa'}
                            />
                        </Pressable>
                    </View>

                    {!providerEmail ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="lock" size={48} color="#475569" />
                            <Text style={styles.emptyText}>Login with Outlook to manage bookings</Text>
                        </View>
                    ) : bookings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={48} color="#475569" />
                            <Text style={styles.emptyText}>No bookings yet. Create your first one!</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={bookings}
                            renderItem={({ item }) => (
                                <View style={styles.eventCard}>
                                    <View style={styles.eventInfo}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 8, gap: 12 }}>
                                            <Text style={styles.eventTitle}>{item.service_name}</Text>
                                            <View style={{
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 6,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor:
                                                    item.status === 'accept' ? 'rgba(34, 197, 94, 0.2)' :
                                                        item.status === 'decline' ? 'rgba(239, 68, 68, 0.2)' :
                                                            'rgba(234, 179, 8, 0.2)'
                                            }}>
                                                <Text style={{
                                                    fontSize: 10,
                                                    fontWeight: '700',
                                                    color:
                                                        item.status === 'accept' ? '#4ade80' :
                                                            item.status === 'decline' ? '#f87171' :
                                                                '#facc15',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {item.status}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.eventMeta}>
                                            <MaterialCommunityIcons name="account-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.eventTime}>{item.provider_email}</Text>
                                        </View>
                                        <View style={[styles.eventMeta, { marginTop: 4 }]}>
                                            <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                                            <Text style={styles.eventTime}>
                                                {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.row}>
                                        {item.status === 'pending' && (
                                            <Pressable style={styles.eventAction} onPress={() => handleOpenEdit(item)}>
                                                <MaterialCommunityIcons name="pencil" size={20} color="#60a5fa" />
                                            </Pressable>
                                        )}
                                        <Pressable style={styles.eventAction} onPress={() => handleDeleteBooking(item.provider_event_id, item.customer_email)}>
                                            <MaterialCommunityIcons name="delete" size={20} color="#ff5f56" />
                                        </Pressable>
                                    </View>
                                </View>
                            )}
                            keyExtractor={item => item.id.toString()}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={loading}
                                    onRefresh={fetchBookings}
                                    tintColor="#60a5fa"
                                    colors={['#60a5fa']}
                                />
                            }
                        />
                    )}
                </View>
            </View>

        </SafeAreaView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f8fafc',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutButton: {
        padding: 8,
        backgroundColor: 'rgba(255, 95, 86, 0.1)',
        borderRadius: 10,
    },
    permissionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    permissionText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94a3b8',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        // marginBottom: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: 2,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: 15,
    },
    actionCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#f8fafc',
        marginBottom: 4,
    },
    actionDesc: {
        fontSize: 11,
        color: '#94a3b8',
        textAlign: 'center',
    },
    listContent: {
        gap: 12,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    eventInfo: {
        flex: 1,
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#f8fafc',
        marginBottom: 6,
    },
    eventMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventTime: {
        fontSize: 13,
        color: '#94a3b8',
        marginLeft: 4,
    },
    eventLocation: {
        fontSize: 13,
        color: '#94a3b8',
        marginLeft: 4,
        flex: 1,
    },
    eventAction: {
        paddingLeft: 12,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#64748b',
        marginTop: 12,
        textAlign: 'center',
    },
    requestButton: {
        marginTop: 20,
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
    },
    requestButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    row: {
        flexDirection: 'row',
    },
}))
