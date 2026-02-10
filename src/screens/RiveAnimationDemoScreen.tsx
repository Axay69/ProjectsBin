import React, { useRef } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import Rive, { RiveRef } from 'rive-react-native';

const RiveAnimationDemoScreen = () => {
    const bearLoginRef = useRef<RiveRef>(null);
    const bearCorIncorRef = useRef<RiveRef>(null);
    const bunnyRef = useRef<RiveRef>(null);

    // Interactive Bunny Handlers
    // NOTE: Replace 'State Machine 1' and input names ('Wave', 'Jump', 'Idle') 
    // with actual names from your Rive file.
    const onBunnyWave = () => {
        try {
            // bunnyRef.current?.fireState('State Machine 1', 'Click');
            // bunnyRef.current?.setInputState(
            //     'State Machine 1',
            //     'Pose',
            //     1,
            // );

        } catch (e) { console.log('Bunny Wave Error:', e); }
    };

    const onBunnyJump = () => {
        try {
            // bunnyRef.current?.fireState('State Machine 1', 'Jump');
        } catch (e) { console.log('Bunny Jump Error:', e); }
    };

    const onBunnyIdle = () => {
        try {
            // bunnyRef.current?.fireState('State Machine 1', 'Idle');
        } catch (e) { console.log('Bunny Idle Error:', e); }
    };

    // Example inputs for Bear Login
    // Check types or names in Rive Editor for: "isChecking", "isHandsUp", "trigSuccess", "trigFail", "look"
    const onLoginSuccess = () => {
        bearLoginRef.current?.fireState('Login Machine', 'trigSuccess');
    };

    const onLoginFail = () => {
        bearLoginRef.current?.fireState('Login Machine', 'trigFail');
    };

    const onCorrect = () => {
        bearCorIncorRef.current?.fireState('State Machine 1', 'Correct');
    };

    const onIncorrect = () => {
        try {

            bearCorIncorRef.current?.fireState('State Machine 1', 'Incorrect');
        } catch (error) {
            console.log('Error in onIncorrect', error);

        }
    };

    const onIdle = () => {
        // bearCorIncorRef.current?.fireState('State Machine 1', 'Idle');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.header}>Rive Animations Demo</Text>

            {/* Interactive Bunny */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>1. Interactive Bunny</Text>
                <View style={styles.riveContainer}>
                    <Rive
                        ref={bunnyRef}
                        // url="interactive_bunny.riv" // This works if bundled in native assets
                        resourceName="interactive_bunny"
                        stateMachineName="State Machine 1" // Check user's Rive file for exact name
                        style={styles.rive}
                        autoplay={true}
                    />
                </View>
                <Text style={styles.description}>Tap buttons to interact with the bunny.</Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#3b82f6' }]}
                        onPress={onBunnyWave}
                    >
                        <Text style={styles.buttonText}>Wave</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#8b5cf6' }]}
                        onPress={onBunnyJump}
                    >
                        <Text style={styles.buttonText}>Jump</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#6b7280' }]}
                        onPress={onBunnyIdle}
                    >
                        <Text style={styles.buttonText}>Idle</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bear Login Animation */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>2. Bear Login</Text>
                <View style={styles.riveContainer}>
                    <Rive
                        ref={bearLoginRef}
                        // url="bear_login.riv" // This works if bundled in native assets
                        resourceName="bear_login"
                        stateMachineName="Login Machine"
                        style={styles.rive}
                    />
                </View>
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        onFocus={() => bearLoginRef.current?.setInputState('Login Machine', 'isChecking', true)}
                        onBlur={() => bearLoginRef.current?.setInputState('Login Machine', 'isChecking', false)}
                    />
                    <TextInput
                        placeholder="Password"
                        secureTextEntry
                        style={styles.input}
                        onFocus={() => bearLoginRef.current?.setInputState('Login Machine', 'isHandsUp', true)}
                        onBlur={() => bearLoginRef.current?.setInputState('Login Machine', 'isHandsUp', false)}
                    />
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.successButton]} onPress={onLoginSuccess}>
                        <Text style={styles.buttonText}>Success</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.failButton]} onPress={onLoginFail}>
                        <Text style={styles.buttonText}>Fail</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Bear Correct/Incorrect */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>3. Bear Feedback</Text>
                <View style={styles.riveContainer}>
                    <Rive
                        autoplay
                        ref={bearCorIncorRef}
                        // url="bear_cor_incor.riv"0
                        resourceName="bear_cor_incor"
                        stateMachineName="State Machine 1"
                        style={styles.rive}
                    />
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.button, styles.successButton]} onPress={onCorrect}>
                        <Text style={styles.buttonText}>Correct</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, styles.failButton]} onPress={onIncorrect}>
                        <Text style={styles.buttonText}>Incorrect</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default RiveAnimationDemoScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1f2937',
        marginBottom: 24,
        textAlign: 'center',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 12,
    },
    riveContainer: {
        height: 200,
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    rive: {
        flex: 1,
    },
    description: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    inputContainer: {
        gap: 10,
        marginBottom: 16,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: '#10b981',
    },
    failButton: {
        backgroundColor: '#ef4444',
    },
    idleButton: {
        backgroundColor: '#6b7280',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
    },
});
