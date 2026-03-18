import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../stores/redux/store';
import { updateName, updateEmail } from '../stores/redux/userSlice';

const ReduxDevToolsDemoScreen = () => {
    const { name, email } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();

    const [newName, setNewName] = useState(name);
    const [newEmail, setNewEmail] = useState(email);

    const handleUpdate = () => {
        dispatch(updateName(newName));
        dispatch(updateEmail(newEmail));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Text style={styles.title}>Redux DevTools Demo</Text>
                    <Text style={styles.subtitle}>
                        Open Dev Menu → Open DevTools to see Redux tab
                    </Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Current State (from Redux)</Text>
                    <View style={styles.stateRow}>
                        <Text style={styles.label}>Name:</Text>
                        <Text style={styles.value}>{name}</Text>
                    </View>
                    <View style={styles.stateRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{email}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Update State</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Name</Text>
                        <TextInput
                            style={styles.input}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="Enter name"
                            placeholderTextColor="#999"
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={newEmail}
                            onChangeText={setNewEmail}
                            placeholder="Enter email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <TouchableOpacity style={styles.button} onPress={handleUpdate}>
                        <Text style={styles.buttonText}>Update Redux Store</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>🔥 What to check in DevTools:</Text>
                    <Text style={styles.infoItem}>• Actions: See 'user/updateName' and 'user/updateEmail'</Text>
                    <Text style={styles.infoItem}>• State: Watch the user object update in real-time</Text>
                    <Text style={styles.infoItem}>• Diff: See exactly what changed between actions</Text>
                    <Text style={styles.infoItem}>• Time Travel: Use the slider to revert state changes</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
    },
    stateRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    label: {
        width: 60,
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
        flex: 1,
    },
    inputGroup: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f0f2f5',
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    button: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    infoBox: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#007AFF',
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0D47A1',
        marginBottom: 10,
    },
    infoItem: {
        fontSize: 14,
        color: '#1565C0',
        marginBottom: 5,
        lineHeight: 20,
    },
});

export default ReduxDevToolsDemoScreen;
