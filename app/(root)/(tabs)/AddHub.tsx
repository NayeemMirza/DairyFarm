import {View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image} from "react-native";
import React, { useState } from "react";
import { useRouter} from "expo-router";
import {HelloIcon} from "@/assets/svg-icons/SVGIcons";
import icons from "@/constants/icons";
import {useGlobalContext} from "@/lib/global-provider";
type AddOption = {
    label: string;
    icon: string;
    route: string;
    color: string;
};
const addOptions: AddOption[] = [
    { label: "Add New Animal", icon: "🐄", route: "/animal/add-animal", color: "#FDE68A" },
    { label: "Add Milk Record", icon: "🥛", route: "/animal/add-milk", color: "#A7F3D0" },
    { label: "Add Vaccination", icon: "💊", route: "/animal/add-vaccinations", color: "#BFDBFE" },
    { label: "Add Expense", icon: "💰", route: "/animal/add-expenses", color: "#FCA5A5" },
];

export default function AddHub() {
    const router = useRouter();
    const { user } = useGlobalContext();

    return (
        <SafeAreaView className="h-full bg-primary-500">
            <View className="flex flex-row items-center justify-between py-5 px-5 mt-8">
                <View className="flex flex-row items-center">
                    <Image
                        source={{ uri: user?.avatar }}
                        className="w-12 h-12 rounded-full"
                    />
                    <View className="ml-2">
                        <View className="flex items-center flex-row gap-2">
                            <HelloIcon width ={25} height={28} />
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
        <View className="flex-1 mt-6 bg-white rounded-t-[2rem] px-5 pt-5 pb-5">
            <ScrollView className="p-5">
                <Text className="text-white text-2xl font-rubik-medium mb-5">
                    What do you want to add?
                </Text>
                <View className="flex flex-row flex-wrap justify-between">
                    {addOptions.map((option, idx) => (
                        <View key={idx} className="w-full mb-4">
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => {
                                    router.push(option.route as any)
                                }}
                                className="rounded-xl p-5 shadow-lg flex-row items-center justify-center gap-2"
                                style={{ backgroundColor: option.color }}
                            >
                                <Text className="text-3xl mr-3">{option.icon}</Text>
                                <Text className="text-gray-800 font-rubik-medium text-center">
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
        </SafeAreaView>
    );
}
