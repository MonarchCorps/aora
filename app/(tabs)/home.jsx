import { View, Text, FlatList, Image, RefreshControl, Button, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '@/constants'
import SearchInput from '@/components/SearchInput'
import Trending from '@/components/Trending'
import EmptyState from '@/components/EmptyState'
import { useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { trendingPosts } from '@/db'
import { StatusBar } from 'expo-status-bar'
import useAuth from '@/hooks/useAuth'
import { useFetchAllPosts } from '@/store/postFn'
import { useQueryClient } from '@tanstack/react-query'

const Home = () => {

    const { auth } = useAuth();
    const queryClient = useQueryClient();
    const { data = [], isLoading } = useFetchAllPosts();

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await queryClient.invalidateQueries({ queryKey: ["all-posts"] });
        setRefreshing(false);
    };

    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={data}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    return (
                        <VideoCard video={item} />
                    )
                }}
                className='mb-8'
                ListHeaderComponent={() => {
                    return (
                        <View className='my-6 px-4 space-y-6'>
                            <View className='justify-between items-start flex-row mb-6'>
                                <View>
                                    <Text className='font-pmedium text-sm text-gray-100'>
                                        Welcome Back,
                                    </Text>
                                    <Text className='text-2xl font-psemibold text-white'>
                                        {auth?.name}
                                    </Text>
                                </View>

                                <View className='mt-1.5'>
                                    <Image
                                        source={images.logoSmall}
                                        className='w-9 h-10'
                                        resizeMode='contain'
                                    />
                                </View>
                            </View>

                            <SearchInput />

                            <View className='w-full flex-1 pt-5 pb-8'>
                                <Text className='text-gray-100 text-lg font-pregular mb-3'>
                                    Trending Videos
                                </Text>
                                <Trending posts={trendingPosts} />
                            </View>
                        </View>
                    )
                }}
                ListEmptyComponent={() => {
                    if (isLoading) {
                        return (
                            <View className='justify-center items-center h-full flex-1 mt-20'>
                                <ActivityIndicator size="60" color="grey" />
                                <Text className='text-[#e1e1e1] font-pmedium'>Fetching Posts...</Text>
                            </View>
                        )
                    }
                    return (
                        <EmptyState
                            title='No videos found'
                            subTitle='Be the first one to upload a video'
                        />
                    )
                }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
            <StatusBar backgroundColor='#161622' style='light' />
        </SafeAreaView>
    )
}

export default Home