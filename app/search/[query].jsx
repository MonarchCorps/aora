import { View, Text, FlatList, Image, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SearchInput from '@/components/SearchInput'
import Trending from '@/components/Trending'
import EmptyState from '@/components/EmptyState'
import { useEffect, useState } from 'react'
import VideoCard from '@/components/VideoCard'
import { useLocalSearchParams } from 'expo-router'
import { useFetchAllPosts, useFetchTrendingPosts } from '@/store/postFn'

const Search = () => {
    const { query } = useLocalSearchParams()
    const { data } = useFetchAllPosts()
    const { data: trendingPosts } = useFetchTrendingPosts()

    const [filteredPosts, setFilteredPosts] = useState([])

    useEffect(() => {
        if (data?.length) {
            const filteredData = data.filter(post => post?.title.toLowerCase().includes(query.toLowerCase()))
            setFilteredPosts(filteredData)
        }
    }, [data, query])

    return (
        <SafeAreaView className='bg-primary h-full'>
            <FlatList
                data={filteredPosts}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => {
                    return (
                        <VideoCard video={item} />
                    )
                }}
                ListHeaderComponent={() => (
                    <View className='my-6 px-4'>
                        <Text className='font-pmedium text-sm text-gray-100'>
                            Search Results
                        </Text>
                        <Text className='text-2xl font-psemibold text-white'>
                            {query}
                        </Text>

                        <View className='mt-6 mb-6'>
                            <SearchInput initialQuery={query} />
                        </View>

                        <View className='w-full flex-1 pt-5 pb-8'>
                            <Text className='text-gray-100 text-lg font-pregular mb-3'>
                                Trending Videos
                            </Text>
                            <Trending posts={trendingPosts} />
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

export default Search