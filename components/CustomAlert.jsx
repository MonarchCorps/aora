import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";

const CustomAlert = ({
    isVisible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "OK",
    cancelText = "Cancel",
    showCancel = true
}) => {
    return (
        <Modal isVisible={isVisible} animationIn="shake" animationOut="pulse">
            <View className="bg-white rounded-xl p-6 items-center shadow-lg w-11/12 mx-auto">
                <Text className="text-lg font-semibold mb-2 text-gray-800">{title}</Text>

                <Text
                    className={`text-base text-center mb-5
                        ${message.type === "error"
                            ? "text-red-500"
                            :
                            message.type === "success"
                                ? "text-green-500" :
                                "text-gray-600"}
                        `}
                >
                    {message.msg}
                </Text>

                <View className="flex-row w-full justify-between">
                    {showCancel && (
                        <TouchableOpacity
                            onPress={onCancel}
                            activeOpacity={0.7}
                            className="flex-1 bg-gray-300 py-3 rounded-lg items-center mr-2"
                        >
                            <Text className="text-gray-800 text-base font-medium">{cancelText}</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onPress={onConfirm}
                        activeOpacity={0.7}
                        className="flex-1 bg-blue-500 py-3 rounded-lg items-center ml-2"
                    >
                        <Text className="text-white text-base font-medium">{confirmText}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default CustomAlert;
