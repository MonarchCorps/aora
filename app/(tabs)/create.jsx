import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FormField from '@/components/FormField'
import { ResizeMode, Video } from 'expo-av'
import AntDesign from '@expo/vector-icons/AntDesign';
import CustomButton from '@/components/CustomButton'
import * as DocumentPicker from 'expo-document-picker'
import * as ImagePicker from 'expo-image-picker'

import { useCreatePost } from '@/store/postFn'
import { navigate } from '@/helper/navigate'
import { useQueryClient } from '@tanstack/react-query'

const Create = () => {

    const [form, setForm] = useState({
        title: '',
        video: null,
        thumbnail: null,
        prompt: ''
    })

    const queryClient = useQueryClient()

    const invalid = Object.values(form).some(val => val === '' || val === null)

    const { mutate, isPending } = useCreatePost()

    const openPicker = async (selectType) => {
        if (isPending) return;
        // const result = await DocumentPicker.getDocumentAsync({
        //     type: selectType === 'image'
        //         ? ['image/png', 'image/jpg', 'image/jpeg']
        //         : ['video/mp4', 'video/gif']
        // });
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: selectType == 'image' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
            aspect: [4, 3],
            quality: 1
        })

        if (!result.canceled) {
            const file = result.assets[0];

            if (selectType === 'image' && file.fileSize > 10485760) {
                return Alert.alert("Error", "Thumbnail file exceeds the 10MB limit");
            }

            if (selectType === 'video' && file.fileSize > 104857600) {
                return Alert.alert("Error", "Video file exceeds the 100MB limit");
            }

            setForm(prev => ({
                ...prev,
                [selectType === 'image' ? 'thumbnail' : 'video']: file
            }));
        }
    };

    const handleSubmit = () => {
        const formData = new FormData()

        formData.append("title", form.title);
        formData.append("prompt", form.prompt);

        formData.append("video", {
            uri: form.video.uri,
            name: `video-${new Date().getTime()}`,
            type: form.video.mimeType,
        });

        formData.append("thumbnail", {
            uri: form.thumbnail.uri,
            name: `thumbnail-${new Date().getTime()}`,
            type: form.thumbnail.mimeType,
        });

        mutate(formData, {
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ["all-posts"] })
                queryClient.invalidateQueries({ queryKey: ["trending-posts"] })
                navigate('/')
            },
            onError: (error) => {
                console.log(error)
                Alert.alert(
                    'Error',
                    error?.response?.data?.message || "Failed to create post",
                )
            }
        })
    }

    return (
        <SafeAreaView className='bg-primary h-full'>
            <ScrollView className='px-4 my-6'>
                <Text className='text-2xl text-white'>
                    Upload Video
                </Text>

                <FormField
                    title="Video Title"
                    value={form.title}
                    placeholder="Give your video a catch title..."
                    handleChangeText={(e) => setForm(prev => ({ ...prev, title: e }))}
                    otherStyles="mt-10"
                    isPending={isPending}
                />

                <View className='mt-7 space-y-2'>
                    <Text className='text-base text-gray-100 font-pmedium'>
                        Upload Video
                    </Text>
                    <TouchableOpacity onPress={() => openPicker('video')}>
                        {form.video ? (
                            <Video
                                source={{
                                    uri: form.video.uri
                                }}
                                style={{ width: '100%', height: 250, borderRadius: 15 }}
                                resizeMode={ResizeMode.COVER}
                            />
                        ) : (
                            <View className='w-full h-40 px-4 bg-black-100 rounded-2xl justify-center items-center'>
                                <View className='size-14 border border-dashed border-secondary-100 justify-center items-center'>
                                    <AntDesign name="cloudupload" size={30} color="gray" />
                                </View>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <View className='mt-7 space-y-2'>
                    <Text className='text-base text-gray-100 font-pmedium'>
                        Thumbnail Image
                    </Text>
                    <TouchableOpacity onPress={() => openPicker('image')}>
                        {form.thumbnail ? (
                            <Image
                                source={form.thumbnail}
                                resizeMode='cover'
                                className='w-full h-64 rounded-2xl'
                            />
                        ) : (
                            <View className='w-full h-16 px-4 bg-black-100 rounded-2xl justify-center items-center border-2 border-black-200 flex-row space-x-2'>
                                <AntDesign name="cloudupload" size={30} color="gray" />
                                <Text className='ml-2 text-sm text-gray-100 font-pmedium'>
                                    Choose A file
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
                <FormField
                    title="AI Prompt"
                    value={form.prompt}
                    placeholder="The prompt you used to create this video"
                    handleChangeText={(e) => setForm(prev => ({ ...prev, prompt: e }))}
                    otherStyles="mt-7"
                    isPending={isPending}
                />
                <Text className='text-red-800 text-base font-roboto'>
                    <Text className='font-extrabold'>Note: {' '}</Text>
                    <Text>Large files take longer to create post!</Text>
                </Text>
                <CustomButton
                    title="Submit & Publish"
                    handlePress={handleSubmit}
                    containerStyles="mt-7 mb-14"
                    isLoading={isPending}
                    disabled={invalid || !form.title.trim() || !form.prompt.trim()}
                />
            </ScrollView>
        </SafeAreaView>
    )
}

export default Create