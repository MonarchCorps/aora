import { useState } from 'react'
import { Text, FlatList, TouchableOpacity, ImageBackground, Image } from 'react-native'
import * as Animatable from 'react-native-animatable'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Video, ResizeMode } from 'expo-av'

const zoomIn = {
    0: {
        scale: 0.9
    },
    1: {
        scale: 1.1
    }
}

const zoomOut = {
    0: {
        scale: 1
    },
    1: {
        scale: 0.9
    }
}

const TrendingItem = ({ activeItem, item }) => {
    const [play, setPlay] = useState(false)

    return (
        <Animatable.View
            className='ml-5'
            animation={activeItem === item?._id ? zoomIn : zoomOut}
            duration={500}
        >
            {
                play ?
                    <Video
                        source={{
                            uri: item.video.url
                        }}
                        className='bg-white/10'
                        style={{ width: 160, height: 240, borderRadius: 15, marginTop: 20 }}
                        resizeMode={ResizeMode.COVER}
                        useNativeControls
                        shouldPlay
                        onPlaybackStatusUpdate={(status) => {
                            if (status.didJustFinish) {
                                setPlay(false)
                            }
                        }}
                    />
                    : <TouchableOpacity className='relative justify-center items-center' activeOpacity={0.7} onPress={() => setPlay(true)}>
                        <ImageBackground
                            source={{
                                uri: item.thumbnail.url
                            }}
                            className='w-52 h-72 rounded-[35px] my-5 overflow-hidden shadow-lg shadow-black/40'
                            resizeMode='cover'
                        />
                        <FontAwesome name="play-circle" size={50} color="#7b8b8b" className='absolute' />
                    </TouchableOpacity>
            }
        </Animatable.View>
    )
}

function Trending({ posts }) {
    const [activeItem, setActiveItem] = useState()

    const viewableItemsChanges = ({ viewableItems }) => {
        if (viewableItems?.length > 0) {
            setActiveItem(viewableItems[0].key)
        }
    }

    return (
        <FlatList
            data={posts}
            keyExtractor={(post) => post._id}
            renderItem={({ item }) => {
                return (
                    <TrendingItem activeItem={activeItem} item={item} />
                )
            }}
            onViewableItemsChanged={viewableItemsChanges}
            viewabilityConfig={{
                itemVisiblePercentThreshold: 70
            }}
            contentOffset={{ x: 170 }}
            horizontal
            showsHorizontalScrollIndicator={false}
        />
    )
}

export default Trending