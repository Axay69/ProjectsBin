import React, { useState } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {
    Sae,
    Hoshi,
    Fumi,
    Kohana,
    Akira,
    Hideo,
    Isao,
    Jiro,
    Kaede,
    Madoka,
    Makiko,
} from 'react-native-textinput-effects';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import MaterialsIcon from 'react-native-vector-icons/MaterialIcons';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const INPUT_TYPES = [
    'Sae',
    'Hoshi',
    'Fumi',
    'Kohana',
    'Akira',
    'Hideo',
    'Isao',
    'Jiro',
    'Kaede',
    'Madoka',
    'Makiko',
] as const;

type InputType = (typeof INPUT_TYPES)[number];

const InputEffectsDemoScreen = () => {
    const { styles, theme } = useStyles(stylesheet);
    const [selectedType, setSelectedType] = useState<InputType>('Sae');

    const renderInput = (type: InputType, label: string, iconName: string) => {
        const commonProps = {
            label,
            style: styles.inputContainer,
            labelStyle: { color: theme.colors.subText },
            inputStyle: { color: theme.colors.typography, },
        };

        switch (type) {
            case 'Sae':
                return (
                    <Sae
                        {...commonProps}
                        iconClass={FontAwesomeIcon}
                        iconName={iconName as any}
                        iconColor={theme.colors.typography}
                        inputPadding={16}
                        labelHeight={24}
                        // @ts-ignore
                        borderHeight={2}
                        autoCapitalize={'none'}
                        autoCorrect={false}
                    // style={{ backgroundColor: '#00000012', }}
                    />
                );
            case 'Hoshi':
                return (
                    <Hoshi
                        {...commonProps}
                        borderColor={theme.colors.primary}
                        maskColor={theme.colors.background}
                        // @ts-ignore
                        borderHeight={3}
                        labelStyle={{ color: theme.colors.subText }}
                    />
                );
            case 'Fumi':
                return (
                    <Fumi
                        {...commonProps}
                        iconClass={FontAwesomeIcon}
                        iconName={iconName as any}
                        iconColor={theme.colors.primary}
                        iconSize={20}
                        // @ts-ignore
                        iconWidth={40}
                        inputPadding={16}
                        labelStyle={{ color: theme.colors.subText }}
                    />
                );
            case 'Kohana':
                return (
                    <Kohana
                        {...commonProps}
                        style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}
                        iconClass={FontAwesomeIcon}
                        iconName={iconName as any} // Mapping for material
                        iconColor={theme.colors.primary}
                        inputPadding={16}
                        labelStyle={{ color: theme.colors.subText }}
                        inputStyle={{ color: theme.colors.primary }}
                        useNativeDriver
                    />
                );
            case 'Akira':
                return (
                    <Akira
                        {...commonProps}
                        borderColor={theme.colors.border}
                        labelStyle={{ color: theme.colors.primary }}
                        inputStyle={{ color: theme.colors.typography }}
                    />
                );
            case 'Hideo':
                return (
                    <Hideo
                        {...commonProps}
                        iconClass={FontAwesomeIcon}
                        iconName={iconName as any}
                        iconColor={theme.colors.typography}
                        iconBackgroundColor={theme.colors.primary}
                        inputStyle={{ color: theme.colors.typography }}
                    />
                );
            case 'Isao':
                return (
                    <Isao
                        {...commonProps}
                        activeColor={theme.colors.primary}
                        passiveColor={theme.colors.subText}
                    />
                );
            case 'Jiro':
                return (
                    <Jiro
                        {...commonProps}
                        borderColor={theme.colors.primary}
                        inputStyle={{ color: theme.colors.typography }}
                    />
                );
            case 'Kaede':
                return (
                    <Kaede
                        {...commonProps}
                        labelStyle={{ backgroundColor: theme.colors.surface, color: theme.colors.typography }}
                        inputStyle={{ backgroundColor: theme.colors.background, color: theme.colors.typography }}
                    />
                );
            case 'Madoka':
                return (
                    <Madoka
                        {...commonProps}
                        borderColor={theme.colors.primary}
                        labelStyle={{ color: theme.colors.primary }}
                        inputStyle={{ color: theme.colors.typography }}
                    />
                );
            case 'Makiko':
                return (
                    <Makiko
                        {...commonProps}
                        labelStyle={{ color: theme.colors.typography }}
                        inputStyle={{ color: theme.colors.subText }}
                        iconClass={FontAwesomeIcon}
                        iconName={iconName as any}
                        iconColor={theme.colors.typography}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Input Animations 💅</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.selectorContainer}
                >
                    {INPUT_TYPES.map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setSelectedType(type)}
                            style={[
                                styles.selectorItem,
                                selectedType === type && styles.selectorItemActive,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.selectorText,
                                    selectedType === type && styles.selectorTextActive,
                                ]}
                            >
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <KeyboardAwareScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
                bottomOffset={20}
            >
                <Text style={styles.sectionTitle}>{selectedType} Effect</Text>

                <View style={styles.inputWrapper}>
                    {renderInput(selectedType, 'Email Address', 'pencil')}
                </View>
                <View style={styles.inputWrapper}>
                    {renderInput(selectedType, 'Password', 'lock')}
                </View>
                <View style={styles.inputWrapper}>
                    {renderInput(selectedType, 'Full Name', 'user')}
                </View>
                <View style={styles.inputWrapper}>
                    {renderInput(selectedType, 'Location', 'map-marker')}
                </View>

            </KeyboardAwareScrollView>
        </View>
    );
};

const stylesheet = createStyleSheet((theme) => ({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: 60,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.typography,
        textAlign: 'center',
        marginBottom: 20,
    },
    selectorContainer: {
        paddingHorizontal: 20,
        gap: 10,
        paddingBottom: 10,
    },
    selectorItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    selectorItemActive: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    selectorText: {
        color: theme.colors.subText,
        fontWeight: '600',
    },
    selectorTextActive: {
        color: '#ffffff',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 100,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.typography,
        marginBottom: 20,
        marginTop: 10,
    },
    inputWrapper: {
        marginBottom: 24,
    },
    inputContainer: {
        // Shared input container styles if needed
    },
}));

export default InputEffectsDemoScreen;
