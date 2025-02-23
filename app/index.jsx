import { Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import CustomButton from '@/components/CustomButton'
import { StatusBar } from 'expo-status-bar'
import { Redirect, router } from 'expo-router'
import useAuth from '@/hooks/useAuth'
import { navigate } from '@/helper/navigate'

export default function Index() {
	const { auth, loading } = useAuth()

	if (loading) return null
	if (auth?._id) return <Redirect href='/home' />

	return (
		<SafeAreaView className='bg-primary h-full'>
			<ScrollView contentContainerStyle={{ height: '100%' }}>
				<View className='w-full min-h-[90vh] items-center justify-center px-4'>
					<Image source={images.logo} className='w-[130px] h-[84px]' resizeMode='contain' />
					<Image source={images.cards} className='max-w-[380px] w-full h-[300px]' resizeMode='contain' />
					<View className='mt-5'>
						<Text className='text-3xl text-[#fff] font-bold text-center'>
							Discover Endless Possibilities with {' '}
							<View className='relative mt-[2.7rem]'>
								<Text className='text-secondary-200 font-bold text-3xl'>Aora</Text>
								<Image source={images.path} className='w-[120px] h-[15px] absolute -bottom-4 -right-10' resizeMode='contain' />
							</View>
						</Text>
						<Text className='text-sm font-pregular text-gray-100 mt-7 text-center'>Where creativity meets innovation: embark on a journey of limitless exploration with Aora</Text>
						<CustomButton title='Continue with Email' containerStyles='mt-7' handlePress={() => navigate('/sign-in')} />
					</View>
				</View>
			</ScrollView>
			<StatusBar backgroundColor='#161622' style='light' />
		</SafeAreaView>
	)
}
