import { Image, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import CustomButton from '@/components/CustomButton'
import { StatusBar } from 'expo-status-bar'
import { router } from 'expo-router'

export default function Index() {
	return (
		<SafeAreaView className='bg-primary h-full'>
			<ScrollView contentContainerStyle={{ height: '100%' }}>
				<View className='w-full min-h-[90vh] items-center justify-center px-4'>
					<Image source={images.logo} className='w-[130px] h-[84px]' resizeMode='contain' />
					<Image source={images.cards} className='max-w-[380px] w-full h-[300px]' resizeMode='contain' />
					<View className='mt-5'>
						<Text className='text-3xl text-[#fff] font-bold text-center'>
							Discover Endless Possibilities with {' '}
							<View className='relative'>
								<Text className='text-u-secondary-200 font-bold text-3xl mt-[2.7rem]'>Aora</Text>
								<Image source={images.path} className='w-[120px] h-[15px] absolute -bottom-3 -right-10' resizeMode='contain' />
							</View>
						</Text>
						<Text className='text-sm font-pregular text-gray-100 mt-7 text-center'>Where creativity meets innovation: embark on a journey of limitless exploration with Aora</Text>
						<CustomButton title='Continue with Email' containerStyles='mt-7' handlePress={() => router.push('/sign-in')} />
					</View>
				</View>
			</ScrollView>
			<StatusBar backgroundColor='#161622' style='light' />
		</SafeAreaView>
	)
}
