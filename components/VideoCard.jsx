import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native'
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ResizeMode, Video } from 'expo-av';

function VideoCard({ video:
    { title, thumbnail, video, creator: {
        username = '',
        avatar = ''
    } },
}) {

    const [play, setPlay] = useState(false)

    return (
        <View className='flex-col items-center px-4 mb-14'>
            <View className='flex-row gap-3 items-start'>
                <View className='justify-center items-center flex-row flex-1'>
                    <View className='w-12 h-12 rounded-lg border border-secondary justify-center items-center p-0.5'>
                        <Image source={{ uri: avatar }} className='size-full rounded-lg' resizeMode='cover' />
                    </View>
                    <View className='justify-center flex-1 ml-3 gap-y-1'>
                        <Text className='text-white font-psemibold' numberOfLines={1}>
                            {title}
                        </Text>
                        <Text className='text-xs text-gray-100 font-pregular' numberOfLines={1}>{username}</Text>
                    </View>
                </View>
                <View className='pt-2'>
                    <Entypo name="dots-three-vertical" size={24} color="#7b8b8b" />
                </View>
            </View>

            {play ? (
                <Video
                    source={{
                        uri: video.url
                    }}
                    style={{ width: '100%', height: 250, borderRadius: 15, marginTop: 20 }}
                    resizeMode={ResizeMode.COVER}
                    useNativeControls
                    shouldPlay
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setPlay(false)
                        }
                    }}
                />
            ) : (
                <TouchableOpacity
                    className='w-full h-60 rounded-xl mt-3 relative justify-center items-center '
                    activeOpacity={0.7}
                    onPress={() => setPlay(true)}
                >
                    <Image
                        source={{ uri: thumbnail.url }}
                        className='size-full rounded-xl mt-3'
                        resizeMode='cover'
                    />

                    <FontAwesome name="play-circle" size={50} color="#7b8b8b" className='absolute' />
                </TouchableOpacity>
            )}
        </View>
    )
}

export default VideoCard