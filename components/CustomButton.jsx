import { ActivityIndicator, Text, TouchableOpacity } from 'react-native'

function CustomButton({ title, handlePress, containerStyles, textStyles, isLoading, disabled }) {
    return (
        <TouchableOpacity
            className={`bg-secondary-200 rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${isLoading || disabled ? 'opacity-50' : ''}`}
            onPress={handlePress}
            activeOpacity={0.7}
            disabled={isLoading || disabled}
        >
            <Text className={`text-primary font-semibold text-lg ${textStyles}`}>
                {
                    isLoading ? <ActivityIndicator size="large" color="#000000" /> : title
                }
            </Text>
        </TouchableOpacity>
    )
}

export default CustomButton