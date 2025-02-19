import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';

function FormField({
    title,
    value,
    placeholder,
    handleChangeText,
    otherStyles,
    keyboardType,
    isPending,
    isPassword = false,
    ...props
}) {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    return (
        <View className={`space-y-2 ${otherStyles}`}>
            <Text className="text-base text-gray-100 font-pmedium">{title}</Text>
            <View
                className={`border-2 w-full h-16 px-4  rounded-2xl items-center flex-row ${isFocused ? 'border-secondary' : 'border-black-200'
                    } ${isPending ? 'bg-[#1e1e2dce]' : 'bg-black-100'}`}
            >
                <TextInput
                    className={`flex-1 text-[#fff] font-psemibold text-base outline-none`}
                    value={value}
                    placeholder={placeholder}
                    placeholderTextColor="#7b7b8b"
                    onChangeText={handleChangeText}
                    keyboardType={keyboardType}
                    secureTextEntry={isPassword && !showPassword}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                    editable={!isPending}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword
                            ? <AntDesign name="eyeo" size={24} color="gray" />
                            : <Feather name="eye-off" size={22} color="gray" />
                        }
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
}

export default FormField
