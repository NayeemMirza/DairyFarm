import {View, Text, TextInput} from 'react-native'
import {useState} from "react";
import cn from "clsx";
interface CustomInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    required?: boolean;
    placeholder?: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
    onValidate?: (isValid: boolean) => void;
    error?: string;
    multiline?:boolean;
}

export default function CustomInput({
    label,
    value,
    onChangeText,
    required = false,
    placeholder,
    secureTextEntry,
    keyboardType,
    error,
    onValidate,
                                        multiline = false,
    }: CustomInputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [touched, setTouched] = useState(false);

    const showError = required && touched && !value?.trim();

    return (
        <View className="mb-4">
            {/* Label with required * */}
            <View className="flex-row items-center">
                <Text className="text-gray-700 font-rubik-medium">{label}</Text>
                {required && <Text className="text-red-500 ml-1">*</Text>}
            </View>

            {/* Input */}
            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={(text) => {
                    onChangeText(text);
                    if (!touched) setTouched(true);
                }}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                    setIsFocused(false);
                    setTouched(true);
                }}
                multiline={ multiline}
                placeholder={placeholder}
                placeholderTextColor="#888"
                className={cn(
                    'border rounded-xl px-3 py-3',
                    isFocused ? 'border-primary-500' : 'border-gray-300',
                    showError ? 'border-red-500' : '',
                    multiline ? 'h-24' : ''
                )}
                textAlignVertical={multiline ? 'top' : 'center'}
            />

            {/* Inline error message */}
            {showError && (
                <Text className="text-red-500 text-xs mt-1">
                    {label} is required
                </Text>
            )}
        </View>
    );
}