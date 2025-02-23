import { Tabs } from 'expo-router'
import { Image, Text, View, Keyboard } from 'react-native'
import { useEffect, useState } from 'react'
import icons from '@/constants/icons'

const TabIcon = ({ icon, color, name, focused }) => {
    return (
        <View className='items-center justify-center' style={{ width: 60 }}>
            <Image source={icon} resizeMode='contain' tintColor={color} className='w-6 h-6' />
            <Text
                className={`${focused ? 'font-semibold' : 'font-pregular'} text-xs`}
                style={{ color, textAlign: 'center' }}
                numberOfLines={1}
            >
                {name}
            </Text>
        </View>
    )
}

const TabsLayout = () => {
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    useEffect(() => {
        const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })
        const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })

        return () => {
            showSubscription.remove()
            hideSubscription.remove()
        }
    }, [])

    return (
        <>
            <Tabs
                screenOptions={{
                    tabBarShowLabel: false,
                    tabBarActiveTintColor: '#FFA001',
                    tabBarInactiveTintColor: '#FFF',
                    tabBarStyle: {
                        backgroundColor: '#161622',
                        borderTopWidth: 0,
                        paddingTop: 6,
                        height: 55,
                        position: 'absolute',
                        bottom: isKeyboardVisible ? -60 : 0, // Move tab bar down when keyboard opens
                        left: 0,
                        right: 0,
                        transition: 'bottom 0.3s ease-in-out' // Smooth animation
                    }
                }}
            >
                <Tabs.Screen name='home' options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={icons.home} color={color} name='Home' focused={focused} />
                    )
                }} />

                <Tabs.Screen name='bookmark' options={{
                    title: 'Bookmark',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={icons.bookmark} color={color} name='Bookmark' focused={focused} />
                    )
                }} />


                <Tabs.Screen name='create' options={{
                    title: 'Create',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={icons.plus} color={color} name='Create' focused={focused} />
                    )
                }} />


                <Tabs.Screen name='profile' options={{
                    title: 'Profile',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={icons.profile} color={color} name='Profile' focused={focused} />
                    )
                }} />
            </Tabs>
        </>
    )
}

export default TabsLayout
