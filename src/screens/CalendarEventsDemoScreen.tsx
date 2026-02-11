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
    Keyboard
} from 'react-native'
// import DateTimePickerModal from "react-native-modal-datetime-picker"
import RNCalendarEvents from 'react-native-calendar-events'
import { createStyleSheet, useStyles } from 'react-native-unistyles'
import { SafeAreaView } from 'react-native-safe-area-context'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'

interface CalendarEvent {
    id: string
    title: string
    startDate: string
    endDate: string
    location?: string
}

export default function CalendarEventsDemoScreen() {
    const { styles, theme } = useStyles(stylesheet)
    const [permissionStatus, setPermissionStatus] = useState<string>('undetermined')
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [newEventTitle, setNewEventTitle] = useState('')
    const [newEventLocation, setNewEventLocation] = useState('')
    const [newEventNotes, setNewEventNotes] = useState('')
    const [isStartDatePickerVisible, setStartDatePickerVisibility] = useState(false)
    const [isEndDatePickerVisible, setEndDatePickerVisibility] = useState(false)
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000)) // 1 hour later

    useEffect(() => {
        checkPermissions()
    }, [])

    const checkPermissions = async () => {
        const status = await RNCalendarEvents.checkPermissions()
        setPermissionStatus(status)
        if (status === 'authorized') {
            fetchTodayEvents()
        }
    }

    const requestPermissions = async () => {
        const status = await RNCalendarEvents.requestPermissions()
        setPermissionStatus(status)
        if (status === 'authorized') {
            fetchTodayEvents()
        } else {
            Alert.alert('Permission Denied', 'Please enable calendar access in settings.')
        }
    }

    const fetchTodayEvents = async () => {
        setLoading(true)
        try {
            const now = new Date()
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).toISOString()
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString()

            const fetchedEvents = await RNCalendarEvents.fetchAllEvents(startOfDay, endOfDay)
            setEvents(fetchedEvents as CalendarEvent[])
        } catch (error) {
            console.error('Error fetching events:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddSilent = async () => {
        if (permissionStatus !== 'authorized') {
            await requestPermissions()
            return
        }

        try {
            const now = new Date()
            const startDate = new Date(now.getTime() + 60 * 60 * 1000).toISOString() // 1 hour from now
            const endDate = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now

            await RNCalendarEvents.saveEvent('Demo Silent Event', {
                startDate,
                endDate,
                location: 'Remote Office',
                notes: 'Created silently from Projects Bin Demo',
            })

            Alert.alert('Success', 'Event added silently to your calendar!')
            fetchTodayEvents()
        } catch (error) {
            Alert.alert('Error', 'Failed to save event.')
            console.error(error)
        }
    }

    const handleOpenCustomDialog = () => {
        setNewEventTitle('')
        setNewEventLocation('')
        setNewEventNotes('')
        setStartDate(new Date())
        setEndDate(new Date(new Date().getTime() + 60 * 60 * 1000))
        setModalVisible(true)
    }

    const showStartDatePicker = () => setStartDatePickerVisibility(true)
    const hideStartDatePicker = () => setStartDatePickerVisibility(false)
    const handleConfirmStartDate = (date: Date) => {
        setStartDate(date)
        hideStartDatePicker()
    }

    const showEndDatePicker = () => setEndDatePickerVisibility(true)
    const hideEndDatePicker = () => setEndDatePickerVisibility(false)
    const handleConfirmEndDate = (date: Date) => {
        setEndDate(date)
        hideEndDatePicker()
    }

    const handleSaveCustomEvent = async () => {
        if (!newEventTitle.trim()) {
            Alert.alert('Validation', 'Please enter an event title.')
            return
        }

        try {
            const id = await RNCalendarEvents.saveEvent(newEventTitle, {
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                location: newEventLocation,
                notes: newEventNotes,
            })

            Alert.alert('Success', 'Event saved to your calendar!')
            setModalVisible(false)
            fetchTodayEvents()

            if (Platform.OS === 'android') {
                // Open the event on Android
                // @ts-ignore
                if (RNCalendarEvents.openEventInCalendar) {
                    // @ts-ignore
                    RNCalendarEvents.openEventInCalendar(parseInt(id, 10))
                }
            }
        } catch (error) {
            console.error('Error saving custom event:', error)
            Alert.alert('Error', 'Failed to save event.')
        }
    }

    const renderEventItem = ({ item }: { item: CalendarEvent }) => (
        <View style={styles.eventCard}>
            <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{item.title}</Text>
                <View style={styles.eventMeta}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#94a3b8" />
                    <Text style={styles.eventTime}>
                        {new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    {item.location && (
                        <>
                            <MaterialCommunityIcons name="map-marker-outline" size={14} color="#94a3b8" style={{ marginLeft: 10 }} />
                            <Text style={styles.eventLocation} numberOfLines={1}>{item.location}</Text>
                        </>
                    )}
                </View>
            </View>
            <Pressable style={styles.eventAction}>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#60a5fa" />
            </Pressable>
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Calendar Events</Text>
                <View style={styles.permissionBadge}>
                    <View style={[styles.dot, { backgroundColor: permissionStatus === 'authorized' ? '#27c93f' : '#ff5f56' }]} />
                    <Text style={styles.permissionText}>{permissionStatus.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.content}>
                {/* Actions Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACTIONS</Text>
                    <View style={styles.actionGrid}>
                        <Pressable style={styles.actionCard} onPress={handleAddSilent}>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(96, 165, 250, 0.1)' }]}>
                                <MaterialCommunityIcons name="calendar-plus" size={24} color="#60a5fa" />
                            </View>
                            <Text style={styles.actionTitle}>Silent Save</Text>
                            <Text style={styles.actionDesc}>Add event instantly</Text>
                        </Pressable>

                        <Pressable style={styles.actionCard} onPress={handleOpenCustomDialog}>
                            <View style={[styles.iconBg, { backgroundColor: 'rgba(192, 132, 252, 0.1)' }]}>
                                <MaterialCommunityIcons name="calendar-edit" size={24} color="#c084fc" />
                            </View>
                            <Text style={styles.actionTitle}>Custom Event</Text>
                            <Text style={styles.actionDesc}>Edit details & save</Text>
                        </Pressable>
                    </View>
                </View>

                {/* Events List */}
                <View style={[styles.section, { flex: 1 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionLabel}>TODAY'S EVENTS</Text>
                        <Pressable onPress={fetchTodayEvents} disabled={loading}>
                            <MaterialCommunityIcons
                                name="refresh"
                                size={20}
                                color={loading ? '#475569' : '#60a5fa'}
                            />
                        </Pressable>
                    </View>

                    {permissionStatus !== 'authorized' ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-lock" size={48} color="#475569" />
                            <Text style={styles.emptyText}>Permission required to view events</Text>
                            <Pressable style={styles.requestButton} onPress={requestPermissions}>
                                <Text style={styles.requestButtonText}>Grant Access</Text>
                            </Pressable>
                        </View>
                    ) : events.length === 0 ? (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons name="calendar-blank" size={48} color="#475569" />
                            <Text style={styles.emptyText}>No events scheduled for today</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={events}
                            renderItem={renderEventItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            </View>

            {/* Custom Event Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>New Event</Text>
                                <Pressable onPress={() => setModalVisible(false)}>
                                    <MaterialCommunityIcons name="close" size={24} color="#94a3b8" />
                                </Pressable>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Title</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Event Title"
                                        placeholderTextColor="#64748b"
                                        value={newEventTitle}
                                        onChangeText={setNewEventTitle}
                                    />
                                </View>

                                <View style={styles.row}>
                                    <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                        <Text style={styles.label}>Starts</Text>
                                        <Pressable style={styles.dateButton} onPress={showStartDatePicker}>
                                            <Text style={styles.dateText}>
                                                {startDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </Text>
                                        </Pressable>
                                    </View>
                                    <View style={[styles.formGroup, { flex: 1 }]}>
                                        <Text style={styles.label}>Ends</Text>
                                        <Pressable style={styles.dateButton} onPress={showEndDatePicker}>
                                            <Text style={styles.dateText}>
                                                {endDate.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Location</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Location (Optional)"
                                        placeholderTextColor="#64748b"
                                        value={newEventLocation}
                                        onChangeText={setNewEventLocation}
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Notes</Text>
                                    <TextInput
                                        style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                                        placeholder="Add notes..."
                                        placeholderTextColor="#64748b"
                                        value={newEventNotes}
                                        onChangeText={setNewEventNotes}
                                        multiline
                                    />
                                </View>

                                <Pressable style={styles.saveButton} onPress={handleSaveCustomEvent}>
                                    <Text style={styles.saveButtonText}>Save Event</Text>
                                </Pressable>
                            </ScrollView>
                        </View>
                    </TouchableWithoutFeedback>
                </KeyboardAvoidingView>

                {/* <DateTimePickerModal
                    isVisible={isStartDatePickerVisible}
                    mode="datetime"
                    onConfirm={handleConfirmStartDate}
                    onCancel={hideStartDatePicker}
                    date={startDate}
                />
                <DateTimePickerModal
                    isVisible={isEndDatePickerVisible}
                    mode="datetime"
                    onConfirm={handleConfirmEndDate}
                    onCancel={hideEndDatePicker}
                    date={endDate}
                    minimumDate={startDate}
                /> */}
            </Modal>
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
        marginBottom: 30,
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
    modalContent: {
        backgroundColor: '#1e293b',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        minHeight: '60%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#f8fafc',
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    dateButton: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },
    dateText: {
        color: '#f8fafc',
        fontSize: 14,
        fontWeight: '600',
    },
    label: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94a3b8',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    input: {
        backgroundColor: '#0f172a',
        borderRadius: 12,
        padding: 16,
        color: '#f8fafc',
        fontSize: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    saveButton: {
        backgroundColor: '#3b82f6',
        padding: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '700',
    },
}))
