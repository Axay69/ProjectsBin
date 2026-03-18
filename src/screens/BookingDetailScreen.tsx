import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Pressable,
    ScrollView,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import DatePicker from 'react-native-date-picker';
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'
import { useNavigation, useRoute } from '@react-navigation/native'

const API_BASE = 'https://87d5-2405-201-200c-90ad-753e-be2e-6bea-42f5.ngrok-free.app'

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
}

export default function BookingDetailScreen() {
    const { styles } = useStyles(stylesheet)
    const navigation = useNavigation()
    const route = useRoute<any>()
    const booking = route.params?.booking
    const isEditMode = !!booking
    const userEmail = useAuthStore(state => state.providerEmail)

    const [loading, setLoading] = useState(false)
    const [service, setService] = useState(booking?.service_name || '')
    const [providerEmail, setProviderEmail] = useState(booking?.provider_email || 'jmkarena.weapplinse@gmail.com')

    const [startTime, setStartTime] = useState(booking ? new Date(booking.start_time) : new Date(new Date().getTime() + 60 * 60 * 1000))
    const [endTime, setEndTime] = useState(booking ? new Date(booking.end_time) : new Date(new Date().getTime() + 60 * 60 * 1000 * 2))

    const [openDate, setOpenDate] = useState(false);
    const [openTime, setOpenTime] = useState(false);
    const [activeType, setActiveType] = useState<'start' | 'end'>('start');
    const [updateCustomer, setUpdateCustomer] = useState(false);

    const formatToLocalISO = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    const showDatePicker = (type: 'start' | 'end') => {
        setActiveType(type);
        setOpenDate(true);
    };

    const showTimePicker = (type: 'start' | 'end') => {
        setActiveType(type);
        setOpenTime(true);
    };

    const handleConfirm = (date: Date) => {
        if (activeType === 'start') {
            setStartTime(date);
            const autoEndDate = new Date(date.getTime() + 60 * 60 * 1000);
            setEndTime(autoEndDate);
        } else {
            const syncedDate = new Date(date);
            syncedDate.setFullYear(startTime.getFullYear());
            syncedDate.setMonth(startTime.getMonth());
            syncedDate.setDate(startTime.getDate());

            if (syncedDate <= startTime) {
                Alert.alert('Invalid Time', 'End time must be after the start time.');
                return;
            }
            setEndTime(syncedDate);
        }
    };

    const handleSave = async () => {
        if (!userEmail) {
            Alert.alert('Error', 'User email not found. Please login again.')
            return
        }
        if (!service.trim()) {
            Alert.alert('Validation', 'Please enter a service name.')
            return
        }
        if (!providerEmail.trim()) {
            Alert.alert('Validation', 'Please enter a provider email.')
            return
        }

        setLoading(true)
        try {
            if (isEditMode) {
                // Update Booking
                if (!booking.customer_event_id) {
                    Alert.alert('Error', 'Missing booking ID for update.');
                    setLoading(false);
                    return;
                }

                const updatePayload = {
                    customerEmail: userEmail,
                    updatedData: {
                        start: {
                            dateTime: formatToLocalISO(startTime),
                            timeZone: "Asia/Kolkata"
                        },
                        end: {
                            dateTime: formatToLocalISO(endTime),
                            timeZone: "Asia/Kolkata"
                        },
                        subject: service
                    }
                };

                console.log(`[Booking] Updating Booking ${booking.customer_event_id}:`, updatePayload);
                await axios.put(`${API_BASE}/api/bookings/${booking.customer_event_id}`, updatePayload);

                Alert.alert('Success', 'Booking updated successfully!');
            } else {
                const payload = {
                    serviceName: service,
                    providerEmail: providerEmail,
                    customerEmail: userEmail,
                    startTime: formatToLocalISO(startTime),
                    endTime: formatToLocalISO(endTime),
                }
                console.log('[Booking] Creating:', payload)
                await axios.post(`${API_BASE}/api/bookings`, payload)
                Alert.alert('Success', 'Booking created successfully!')
            }
            navigation.goBack()
        } catch (error) {
            console.error('[Booking] Save Error:', error)
            Alert.alert('Error', 'Failed to save booking.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.card}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Service Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Hair Setting"
                                    placeholderTextColor="#64748b"
                                    value={service}
                                    onChangeText={setService}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Provider Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="provider@example.com"
                                    placeholderTextColor="#64748b"
                                    value={providerEmail}
                                    onChangeText={setProviderEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Customer Email (You)</Text>
                                <TextInput
                                    style={[styles.input, { opacity: 0.5 }]}
                                    value={userEmail || ''}
                                    editable={false}
                                />
                            </View>

                            <View style={styles.timeSection}>
                                <Text style={styles.label}>Booking Schedule</Text>

                                <Pressable
                                    style={styles.timeCard}
                                    onPress={() => showDatePicker('start')}
                                >
                                    <View style={styles.timeIcon}>
                                        <MaterialCommunityIcons name="clock-start" size={24} color="#60a5fa" />
                                    </View>
                                    <View>
                                        <Text style={styles.timeLabel}>Starts</Text>
                                        <Text style={styles.timeValue}>
                                            {startTime.toLocaleString([], {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </Text>
                                    </View>
                                </Pressable>

                                <Pressable
                                    style={styles.timeCard}
                                    onPress={() => showTimePicker('end')}
                                >
                                    <View style={styles.timeIcon}>
                                        <MaterialCommunityIcons name="clock-end" size={24} color="#f87171" />
                                    </View>
                                    <View>
                                        <Text style={styles.timeLabel}>Ends</Text>
                                        <Text style={styles.timeValue}>
                                            {endTime.toLocaleString([], {
                                                dateStyle: 'medium',
                                                timeStyle: 'short'
                                            })}
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>
                        </View>

                        {isEditMode && false && (
                            <Pressable
                                style={styles.checkboxContainer}
                                onPress={() => setUpdateCustomer(prev => !prev)}
                            >
                                <MaterialCommunityIcons
                                    name={updateCustomer ? "checkbox-marked" : "checkbox-blank-outline"}
                                    size={24}
                                    color={updateCustomer ? "#60a5fa" : "#94a3b8"}
                                />
                                <Text style={styles.checkboxLabel}>Update Customer Calendar Too</Text>
                            </Pressable>
                        )}

                        <Pressable
                            style={[styles.saveButton, loading && { opacity: 0.7 }]}
                            onPress={handleSave}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    {isEditMode ? 'Update Booking' : 'Confirm Booking'}
                                </Text>
                            )}
                        </Pressable>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <DatePicker
                modal
                open={openDate}
                date={activeType === 'start' ? startTime : endTime}
                mode="date"
                onConfirm={selectedDate => {
                    setOpenDate(false);
                    handleConfirm(selectedDate);
                }}
                onCancel={() => {
                    setOpenDate(false);
                }}
            />

            <DatePicker
                modal
                open={openTime}
                date={activeType === 'start' ? startTime : endTime}
                mode="time"
                onConfirm={selectedTime => {
                    setOpenTime(false);
                    handleConfirm(selectedTime);
                }}
                onCancel={() => {
                    setOpenTime(false);
                }}
            />
        </SafeAreaView>
    )
}

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: '#0f172a',
    },
    scrollContent: {
        padding: 20,
        gap: 20,
    },
    card: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94a3b8',
        marginBottom: 8,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 16,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeSection: {
        gap: 12,
    },
    timeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0f172a',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    timeIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    timeLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    timeValue: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f8fafc',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '800',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        gap: 10,
    },
    checkboxLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#f8fafc',
    },
}))
