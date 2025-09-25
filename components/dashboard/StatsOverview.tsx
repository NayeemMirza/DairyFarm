import React from "react";
import { View, Text } from "react-native";
import { ClipboardList, Droplets, Milk, DollarSign } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import {Skeleton} from "@/components/Skeleton";
interface StatsOverviewProps {
    stats: Stats;
    isLoading: boolean;
}
interface Stats {
    totalAnimals: number;
    lactatingAnimals: number;
    totalMilkThisMonth: number;
    totalExpensesThisMonth: number;
}
export default function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
    const statCards = [
        {
            title: "Total Animals",
            value: stats.totalAnimals,
            icon: ClipboardList,
            gradientColors: ["#22c55e", "#10b981"], // green gradient
            bgColor: "bg-green-100",
        },
        {
            title: "Lactating Animals",
            value: stats.lactatingAnimals,
            icon: Droplets,
            gradientColors: ["#3b82f6", "#6366f1"], // blue gradient
            bgColor: "bg-blue-100",
        },
        {
            title: "Milk This Month",
            value: `${stats.totalMilkThisMonth}L`,
            icon: Milk,
            gradientColors: ["#a78bfa", "#ec4899"], // purple-pink gradient
            bgColor: "bg-purple-100",
        },
        {
            title: "Monthly Expenses",
            value: `$${stats.totalExpensesThisMonth}`,
            icon: DollarSign,
            gradientColors: ["#f97316", "#ef4444"], // orange-red gradient
            bgColor: "bg-orange-100",
        },
    ];

    return (
        <View className="flex flex-wrap justify-between mb-8">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <View
                        key={index}
                        className="w-full sm:w-1/2 lg:w-1/4 p-2"
                    >
                        <View className="relative bg-white/80 rounded-xl p-6 shadow-lg overflow-hidden">
                            {/* Background gradient circle */}
                            <LinearGradient
                                colors={stat.gradientColors as [string, string]}
                                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 transform translate-x-8 -translate-y-8"
                            />
                            <View className="flex flex-row justify-between items-start">
                                <View>
                                    <Text className="text-gray-600 text-sm mb-2 font-medium">
                                        {stat.title}
                                    </Text>
                                    <Text className="text-gray-800 font-bold text-2xl md:text-3xl">
                                        {isLoading ? <Skeleton className="h-8 w-20" /> : stat.value}
                                    </Text>
                                </View>
                                <View
                                    className={`p-3 rounded-xl ${stat.bgColor} justify-center items-center`}
                                >
                                    <Icon
                                        size={24}
                                        // Using gradient for icon requires masking or SVG library; simplified here
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
}
