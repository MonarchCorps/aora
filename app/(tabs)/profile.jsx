import { View, FlatList, Image, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '@/components/EmptyState'
import VideoCard from '@/components/VideoCard'
import { items } from '@/db'
import useAuth from '@/hooks/useAuth'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import InfoBox from '@/components/InfoBox'
import { replace } from '@/helper/navigate'

const Profile = () => {
    const { auth } = useAuth()

    const logout = () => {

    }

    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={items}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    return (
                        <VideoCard video={item} />
                    )
                }}
                className='mb-12'
                ListHeaderComponent={() => (
                    <View className='w-full justify-center items-center mt-6 mb-12 px-4'>
                        <TouchableOpacity
                            className='w-full items-end mb-10'
                            onPress={() => replace('/sign-in')}
                        >
                            <MaterialIcons name="logout" size={24} color="red" className='opacity-60' />
                        </TouchableOpacity>
                        <View className='w-16 h-16 border border-secondary rounded-lg justify-center items-center'>
                            <Image
                                source={{ uri: auth?.avatar }}
                                className='size-[90%] rounded-lg'
                                resizeMode='cover'
                            />
                        </View>
                        <InfoBox
                            title={auth?.name}
                            containerStyles='mt-5'
                            titleStyles='text-lg'
                        />
                        <View className='mt-5 flex-row '>
                            <InfoBox
                                title={items.length || 0}
                                subTitle='Posts'
                                containerStyles='mr-5'
                                titleStyles='text-xl'
                            />
                            <InfoBox
                                title={"1.2k"}
                                subTitle="Followers"
                                titleStyles='text-xl'
                            />
                        </View>
                    </View>
                )}
                ListEmptyComponent={() => {
                    return (
                        <EmptyState
                            title='No videos found'
                            subTitle='No videos found for this search query'
                        />
                    )
                }}
            />
        </SafeAreaView>
    )
}

export default Profile