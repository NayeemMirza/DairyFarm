import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";

import icons from "@/constants/icons";
import Search from "@/components/Search";
import { Card } from "@/components/Cards";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import {useApi} from "@/lib/useApi";
import {getAnimals} from "@/lib/appwrite";


const Animals = () => {
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();

    const {
        data: animals,
        refetch,
        loading,
    } = useApi({
        fn: getAnimals,
        params: {
            filter: params.filter!,
            query: params.query!,
        },
        skip: true,
    });

    useEffect(() => {
        refetch({
            filter: params.filter!,
            query: params.query!,
        });
    }, [params.filter, params.query]);

    const handleCardPress = (id: string) => router.push(`/animal/${id}`);

    return (
        <SafeAreaView className="h-full bg-primary-500">
            <FlatList
                data={animals}
                numColumns={2}
                renderItem={({ item }) => (
                    <Card item={item} onPress={() => handleCardPress(item.id.toString())} />
                )}
                keyExtractor={(item, index) => item.id?.toString() || `animal-${index}`}
                contentContainerClassName="pb-32 bg-white"
                columnWrapperClassName="flex gap-1 px-3"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator size="large" className="text-primary-300 mt-5" />
                    ) : (
                        <NoResults />
                    )
                }
                ListHeaderComponent={() => (
                    <View className="px-0">
                        <View className="flex flex-row items-center justify-between px-5 pt-12 pb-6 bg-primary-500">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="flex flex-row bg-primary-200 rounded-full size-11 items-center justify-center"
                            >
                                <Image source={icons.backArrow} className="size-5" />
                            </TouchableOpacity>

                            <Text className="text-3xl mr-2 text-center font-rubik-medium text-white">
                                Animals
                            </Text>
                            <Image source={icons.bell} className="w-6 h-6" />
                        </View>

                        <View className="bg-primary-500">
                            <View className="bg-white rounded-t-[2rem] px-5 pt-5 pb-5">
                                <Search />

                        <View className="mt-5">
                            <Filters />

                            <Text className="text-xl font-rubik-bold text-black-300 mt-5">
                                Total: {animals?.length} Animals
                            </Text>
                        </View>
                            </View>
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default Animals;