import { View, Text, ScrollView, Image, Vibration, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '@/constants';
import FormField from '../../components/FormField';
import { useState } from 'react';
import CustomButton from '../../components/CustomButton';
import { Link } from 'expo-router';
import { useRegister } from '@/store/authFn';
import useAuth from '../../hooks/useAuth';
import { navigate } from '../../helper/navigate';
import CustomAlert from '@/components/CustomAlert';
import { storeAccessToken, storeRefreshToken } from '@/helper/tokens';

const SignUp = () => {
    const { setAuth } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
    });
    const { mutate, isPending } = useRegister();
    const [isAlertVisible, setAlertVisible] = useState(false);
    const [message, setMessage] = useState({ msg: '', type: '' });

    const invalid = Object.values(form).some((val) => val === '');

    const handleSubmit = async (data) => {
        if (invalid) return;

        mutate(data, {
            onSuccess: async (data) => {
                console.log(`Registered ${JSON.stringify(data)}`)
                await storeAccessToken(data?.accessToken);
                await storeRefreshToken(data?.refreshToken);
                setAuth(data?.userDetails);
                // navigate('/');
            },
            onError: (error) => {
                console.log(error)
                setMessage({
                    msg: error?.response?.data?.message
                        || 'Failed to register',
                    type: 'error',
                });
                setAlertVisible(true);
                Vibration.vibrate(300);
            },
        });
    };

    return (
        <SafeAreaView className="bg-primary h-full">
            <ScrollView>
                <View className="w-full min-h-[90vh] justify-center px-4 my-6 max-w-[600px] mx-auto">
                    <Image
                        source={images.logo}
                        resizeMode="contain"
                        className="w-[115px] h-[35px] self-center mb-4"
                    />
                    <Text className="text-2xl text-[#fff] font-semibold mt-10">
                        Sign Up to Aora
                    </Text>

                    <FormField
                        title="Name"
                        value={form.name}
                        handleChangeText={(e) => setForm((prev) => ({ ...prev, name: e }))}
                        otherStyles="mt-7"
                        isPending={isPending}
                    />

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm((prev) => ({ ...prev, email: e }))}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                        isPending={isPending}
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm((prev) => ({ ...prev, password: e }))}
                        otherStyles="mt-7"
                        isPassword={true}
                        isPending={isPending}
                    />

                    <CustomButton
                        title="Sign Up"
                        handlePress={() => handleSubmit(form)}
                        containerStyles="mt-7"
                        isLoading={isPending}
                        disabled={invalid}
                    />

                    <View className="justify-center pt-8 flex-row gap-5">
                        <Text className="text-lg text-gray-100">
                            Already have an account?{' '}
                            <Link href="sign-in" className="text-lg font-semibold text-secondary underline">
                                Sign In
                            </Link>
                        </Text>
                    </View>
                </View>

                <CustomAlert
                    isVisible={isAlertVisible}
                    title="Registration Failed"
                    message={message}
                    onCancel={() => setAlertVisible(false)}
                    onConfirm={() => {
                        setAlertVisible(false);
                        handleSubmit(form);
                    }}
                    confirmText="Try Again"
                    cancelText="Close"
                />
            </ScrollView>
        </SafeAreaView >
    );
};

export default SignUp;
