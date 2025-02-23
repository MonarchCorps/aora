import { View, Text, Image } from 'react-native'
import { images } from '@/constants'
import CustomButton from './CustomButton'
import { navigate } from '@/helper/navigate'

function EmptyState({ title, subTitle }) {
    return (
        <View className='justify-center items-center px-4 mb-8'>
            <Image
                source={images.empty}
                className='w-[16.88rem] h-[13.44rem]'
                resizeMode='contain'
            />
            <Text className='font-pmedium text-sm text-gray-100'>
                {title}
            </Text>
            <Text className='text-xl text-center font-psemibold text-white'>
                {subTitle}
            </Text>

            <CustomButton
                title="Create video"
                handlePress={() => navigate('/create')}
                containerStyles='w-full my-5'
            />
        </View>
    )
}

export default EmptyState