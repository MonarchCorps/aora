import { View, Text, ScrollView, Image, Vibration } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import FormField from '../../components/FormField'
import { useState } from 'react'
import CustomButton from '../../components/CustomButton'
import { Link } from 'expo-router'

const SignIn = () => {
    const [form, setForm] = useState({
        state: '',
        password: ''
    })

    return (
        <SafeAreaView className='bg-primary h-full'>
            <ScrollView>
                <View className='w-full min-h-[85vh] justify-center px-4 my-6  max-w-[600px] mx-auto'>
                    <Image
                        source={images.logo}
                        resizeMode="contain"
                        className="w-[115px] h-[35px] self-center mb-4"
                    />
                    <Text className='text-2xl text-[#fff] text-semibold mt-10 font-psemibold'>
                        Log in to Aora
                    </Text>

                    <FormField
                        title='Email or Name'
                        value={form.state}
                        handleChangeText={(e) => setForm({ ...form, state: e })}
                        otherStyles='mt-7'
                    />

                    <FormField
                        title='Password'
                        value={form.password}
                        handleChangeText={(e) => setForm({ ...form, password: e })}
                        otherStyles='mt-7'
                    />

                    <CustomButton
                        title='Sign In'
                        handlePress={() => handleSubmit(form)}
                        containerStyles='mt-7'
                    />

                    <View className='justify-center pt-8 flex-row gap-5'>
                        <Text className='text-lg text-gray-100 font-pregular'>
                            Don&apos;t have an account?{'  '}
                            <Link href='/(auth)/sign-up' className='text-lg font-psemibold text-secondary underline'>
                                Sign Up
                            </Link>
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    )
}

export default SignIn