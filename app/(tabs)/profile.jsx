import { View, FlatList, Image, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '@/components/EmptyState'
import VideoCard from '@/components/VideoCard'
import useAuth from '@/hooks/useAuth'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import InfoBox from '@/components/InfoBox'
import { replace } from '@/helper/navigate'
import { useFetchAllPosts, useFetchUserPosts } from '@/store/postFn'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { clearStorage } from '@/helper/tokens'

const Profile = () => {
    const { auth } = useAuth()
    const queryClient = useQueryClient();

    const { data = [] } = useFetchAllPosts()

    const [refreshing, setRefreshing] = useState(false);
    const [userPosts, setUserPosts] = useState([])

    useEffect(() => {
        if (data?.length) {
            const filteredData = data.filter(post => post?.creator?._id === auth?._id)
            setUserPosts(filteredData)
        }
    }, [data])

    const onRefresh = async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ["all-posts"] });
        setRefreshing(false);
    };

    const logout = async () => {
        await clearStorage()
        replace('/sign-in')
    }

    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={userPosts}
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
                            onPress={logout}
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
                                title={userPosts?.length || 0}
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
                            subTitle='Your posts are unavailable'
                        />
                    )
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    )
}

export default Profile