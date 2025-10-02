import {
    ActivityIndicator,
    FlatList,
    Image,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import icons from "@/constants/icons";

import Search from "@/components/Search";
import Filters from "@/components/Filters";
import NoResults from "@/components/NoResults";
import { Card, FeaturedCard } from "@/components/Cards";

import { useGlobalContext } from "@/lib/global-provider";
import {getLatestAnimals, getAnimals, getUserStats} from "@/lib/appwrite";
import { useApi } from "@/lib/useApi";
import { HelloIcon } from "@/assets/svg-icons/SVGIcons";
import StatsOverview from "@/components/dashboard/StatsOverview";
import MilkProductionChart from "@/components/dashboard/MilkProductionChart";

interface Stats {
    totalAnimals: number;
    lactatingAnimals: number;
    totalMilkThisMonth: number;
    totalExpensesThisMonth: number;
}

const Home = () => {
    const { user } = useGlobalContext();
    const params = useLocalSearchParams<{ query?: string; filter?: string }>();

    // animals
    const { data: latestAnimals, loading: latestAnimalsLoading } = useApi({
        fn: getLatestAnimals,
    });

    const { data: animals, refetch, loading } = useApi({
        fn: getAnimals,
        params: {
            filter: params.filter || undefined,
            query: params.query || undefined,
            limit: 6,
        },
        skip: true,
    });

    useEffect(() => {
        refetch({
            filter: params.filter || undefined,
            query: params.query || undefined,
            limit: 6,
        }).catch((err) => console.error(err));
    }, [params.filter, params.query]);

    const handleCardPress = (id: string) => router.push(`/animal/${id}`);

    // 📊 User Stats
    const [stats, setStats] = useState<Stats>({
        totalAnimals: 0,
        lactatingAnimals: 0,
        totalMilkThisMonth: 0,
        totalExpensesThisMonth: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setStatsLoading(true);
                const data = await getUserStats();
                setStats(data);
            } catch (err) {
                console.error("Failed to load stats:", err);
            } finally {
                setStatsLoading(false);
            }
        };
        fetchStats();
    }, []);

    // 🥛 Milk chart (for now still using sample data — later can use real milking records)
    const sampleMilkRecords = [
        { date: "2025-09-01", total_yield: 120 },
        { date: "2025-09-02", total_yield: 150 },
        { date: "2025-09-04", total_yield: 130 },
        { date: "2025-09-07", total_yield: 125 },
    ];

    return (
        <SafeAreaView className="h-full bg-primary-500">
            <FlatList
                data={animals}
                numColumns={2}
                renderItem={({ item }) => (
                    <Card
                        item={item}
                        onPress={() => handleCardPress(item.id.toString())}
                    />
                )}
                keyExtractor={(item, index) => item.id?.toString() || `animal-${index}`}
                contentContainerClassName="pb-32 bg-white"
                columnWrapperClassName="flex gap-0 px-3"
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    loading ? (
                        <ActivityIndicator
                            size="large"
                            className="text-primary-300 mt-5"
                        />
                    ) : (
                        <NoResults />
                    )
                }
                ListHeaderComponent={() => (
                    <View className="px-0">
                        {/* User Info Header */}
                        <View className="flex flex-row items-center justify-between py-5 px-5 bg-primary-500">
                            <View className="flex flex-row items-center">
                                <Image
                                    source={{ uri: user?.avatar }}
                                    className="w-12 h-12 rounded-full"
                                />
                                <View className="ml-2">
                                    <View className="flex items-center flex-row gap-2">
                                        <HelloIcon width={25} height={28} />
                                        <View>
                                            <Text className="text-base font-rubik-medium text-white">
                                                Hi {user?.name}
                                            </Text>
                                            <Text className="text-base font-rubik text-white">
                                                Welcome Back
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                            <Image source={icons.bell} className="w-6 h-6" />
                        </View>

                        {/* Search */}
                        <View className="bg-primary-500">
                            <View className="bg-white rounded-t-[2rem] px-5 pt-5 pb-5">
                                <Search />
                            </View>
                        </View>

                        {/* ✅ Live Stats */}
                        <View className="my-5 px-5">
                            {statsLoading ? (
                                <ActivityIndicator
                                    size="large"
                                    className="text-primary-300 mt-5"
                                />
                            ) : (
                                <StatsOverview stats={stats} isLoading={false} />
                            )}
                        </View>

                        {/* Milk Chart */}
                        <View className="my-5 px-5">
                            <MilkProductionChart milkRecords={sampleMilkRecords} isLoading={false} />
                        </View>

                        {/* New Animals */}
                        <View className="my-5 px-5">
                            <View className="flex flex-row items-center justify-between">
                                <Text className="text-xl font-rubik-bold text-black-300">
                                    New Animals
                                </Text>
                                <TouchableOpacity onPress={() => router.push("/animals")}>
                                    <Text className="text-base font-rubik-bold text-primary-300">
                                        See all
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {latestAnimalsLoading ? (
                                <ActivityIndicator
                                    size="large"
                                    className="text-primary-500 mt-5"
                                />
                            ) : !latestAnimals || latestAnimals.length === 0 ? (
                                <NoResults />
                            ) : (
                                <FlatList
                                    data={latestAnimals}
                                    renderItem={({ item }) => (
                                        <FeaturedCard
                                            item={item}
                                            onPress={() => handleCardPress(item.id.toString())}
                                        />
                                    )}
                                    keyExtractor={(item, index) =>
                                        item.id?.toString() || `featured-${index}`
                                    }
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerClassName="flex gap-5 mt-5"
                                />
                            )}
                        </View>

                        {/* Recommendation Section */}
                        <View className="mt-5 px-5">
                            <View className="flex flex-row items-center justify-between">
                                <Text className="text-xl font-rubik-bold text-black-300">
                                    Our Recommendation
                                </Text>
                                <TouchableOpacity>
                                    <Text className="text-base font-rubik-bold text-primary-300">
                                        See all
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Filters />
                        </View>
                    </View>
                )}
            />
        </SafeAreaView>
    );
};

export default Home;
