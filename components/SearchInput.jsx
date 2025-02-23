import { useState } from 'react'
import { View, TextInput, TouchableOpacity, Alert } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign';
import { router, usePathname } from 'expo-router';
import { navigate } from '@/helper/navigate';

function SearchInput({ initialQuery }) {
    const pathName = usePathname()
    const [query, setQuery] = useState(initialQuery || '')

    return (
        <View
            className={`border-black-200 border-2 w-full h-16 px-4 bg-black-100 rounded-2xl items-center flex-row space-x-4`}
        >
            <TextInput
                value={query}
                className={`text-base mt-0.5 text-white flex-1 font-pregular`}
                placeholder='Search for a video topic'
                placeholderTextColor={'#CDCDE0'}
                onChangeText={(e) => setQuery(e)}
            />
            <TouchableOpacity
                onPress={() => {
                    if (!query) return Alert.alert(
                        'Missing query',
                        'Please input something to search results across database'
                    )

                    if (pathName.startsWith('/search')) router.setParams({ query })
                    else navigate(`/search/${query}`)
                }}
            >
                <AntDesign name="search1" size={24} color="white" />
            </TouchableOpacity>
        </View>
    )
}

export default SearchInput
