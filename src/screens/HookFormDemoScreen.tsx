import React from 'react';
import { View, Text, TextInput, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvoidSoftInput } from 'react-native-avoid-softinput';
import { useEffect } from 'react';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface FormData {
    username: string;
    email: string;
    phone: string;
    address: string;
    age: string;
    password: string;
    confirmPassword: string;
    notes: string;
}

export default function HookFormDemoScreen() {
    const { styles, theme } = useStyles(stylesheet);

    useEffect(() => {
        // AvoidSoftInput.setShouldAvoidOffset(true);
        AvoidSoftInput.setEnabled(true);
        AvoidSoftInput.setAvoidOffset(10); // Add a small offset
        return () => {
            AvoidSoftInput.setEnabled(false);
            // AvoidSoftInput.setShouldAvoidOffset(false);
        };
    }, []);

    const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<FormData>({
        defaultValues: {
            username: '',
            email: '',
            phone: '',
            address: '',
            age: '',
            password: '',
            confirmPassword: '',
            notes: '',
        }
    });

    const password = watch('password');

    const onSubmit = (data: FormData) => {
        Alert.alert('Form Submitted', JSON.stringify(data, null, 2));
        reset();
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.header}>React Hook Form</Text>
                <Text style={styles.subHeader}>Zero-Re-Render Validation</Text>

                {/* Username */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Username</Text>
                    <Controller
                        control={control}
                        rules={{ required: 'Username is required', minLength: { value: 3, message: 'Minimum 3 characters' } }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.username && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Pick a username"
                                placeholderTextColor={theme.colors.placeholder}
                            />
                        )}
                        name="username"
                    />
                    {errors.username && <Text style={styles.errorText}>{errors.username.message}</Text>}
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Email is required',
                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email format' }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.email && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="your@email.com"
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        )}
                        name="email"
                    />
                    {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Phone is required',
                            pattern: { value: /^[0-9]{10}$/, message: 'Invalid phone (10 digits)' }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.phone && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="e.g. 1234567890"
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="phone-pad"
                            />
                        )}
                        name="phone"
                    />
                    {errors.phone && <Text style={styles.errorText}>{errors.phone.message}</Text>}
                </View>

                {/* Address */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Home Address</Text>
                    <Controller
                        control={control}
                        rules={{ required: 'Address is required' }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.address && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="123 Street Name"
                                placeholderTextColor={theme.colors.placeholder}
                            />
                        )}
                        name="address"
                    />
                    {errors.address && <Text style={styles.errorText}>{errors.address.message}</Text>}
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Age</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Age is required',
                            validate: (val) => parseInt(val) >= 18 || 'Must be 18+'
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.age && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="e.g. 25"
                                placeholderTextColor={theme.colors.placeholder}
                                keyboardType="numeric"
                            />
                        )}
                        name="age"
                    />
                    {errors.age && <Text style={styles.errorText}>{errors.age.message}</Text>}
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Minimum 6 characters' }
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.password && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="••••••••"
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry
                            />
                        )}
                        name="password"
                    />
                    {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Please confirm password',
                            validate: (val) => val === password || 'Passwords do not match'
                        }}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, errors.confirmPassword && styles.inputError]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="••••••••"
                                placeholderTextColor={theme.colors.placeholder}
                                secureTextEntry
                            />
                        )}
                        name="confirmPassword"
                    />
                    {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
                </View>

                {/* Notes (Demonstrates AvoidSoftInput better) */}
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Additional Notes</Text>
                    <Controller
                        control={control}
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                style={[styles.input, styles.multilineInput]}
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Tell us more..."
                                placeholderTextColor={theme.colors.placeholder}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />
                        )}
                        name="notes"
                    />
                </View>

                <TouchableOpacity activeOpacity={0.8} style={styles.button} onPress={handleSubmit(onSubmit)}>
                    <Text style={styles.buttonText}>Submit Data</Text>
                </TouchableOpacity>

                <View style={styles.info}>
                    <Text style={styles.infoTitle}>Why use React Hook Form?</Text>
                    <Text style={styles.infoText}>
                        1. **Performance**: Only the specific input being typed re-renders. The whole screen stays static.{"\n"}
                        2. **Native Support**: Works perfectly with React Native's controlled inputs.{"\n"}
                        3. **Validation**: Built-in support for required, patterns, and custom async validation.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const stylesheet = createStyleSheet((theme) => ({
    container: { flex: 1, backgroundColor: theme.colors.background },
    content: { padding: theme.spacing.lg },
    header: { fontSize: 28, fontWeight: '800', color: theme.colors.typography },
    subHeader: { fontSize: 16, color: theme.colors.subText, marginBottom: theme.spacing.xl },
    inputGroup: { marginBottom: theme.spacing.lg },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.typography, marginBottom: theme.spacing.md },
    input: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        color: theme.colors.typography,
    },
    multilineInput: {
        height: 120,
        paddingTop: 16,
    },
    inputError: { borderColor: theme.colors.error },
    errorText: { color: theme.colors.error, fontSize: 12, marginTop: 4, fontWeight: '500' },
    button: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 32,
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    info: {
        backgroundColor: theme.colors.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    infoTitle: { fontSize: 15, fontWeight: '700', color: theme.colors.accent, marginBottom: 8 },
    infoText: { fontSize: 13, color: theme.colors.typography, lineHeight: 20 },
}));
