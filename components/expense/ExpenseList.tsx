import React from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { Edit, DollarSign, IndianRupee} from "lucide-react-native";
import {ExpenseType} from "@/types/expance";

interface ExpenseListProps {
    expenses: ExpenseType[];
    isLoading: boolean;
    onEdit: (expense: ExpenseType) => void;
}

export default function ExpenseList({ expenses, isLoading, onEdit }: ExpenseListProps) {
    const categoryColors: Record<string, string> = {
        Feed: "bg-green-100 text-green-800",
        Medicine: "bg-red-100 text-red-800",
        Equipment: "bg-blue-100 text-blue-800",
        Labor: "bg-purple-100 text-purple-800",
        Utilities: "bg-yellow-100 text-yellow-800",
        Maintenance: "bg-orange-100 text-orange-800",
        Transport: "bg-indigo-100 text-indigo-800",
        Other: "bg-gray-100 text-gray-800",
    };

    if (isLoading) {
        return (
            <View className="bg-white rounded-2xl shadow-lg p-4">
                <Text className="text-gray-400">Loading expenses...</Text>
            </View>
        );
    }

    if (expenses.length === 0) {
        return (
            <View className="bg-white rounded-2xl shadow-lg p-6 items-center">
                <IndianRupee size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4">
                    No expenses found for the selected period.
                </Text>
            </View>
        );
    }

    return (
        <View className="bg-white p-5 rounded-2xl shadow-lg border border-gray-200 mb-5">

            <FlatList
                data={expenses}
                keyExtractor={(item) => String(item.id)}
                contentContainerClassName="flex gap-5 flex-row"
                renderItem={({ item }) => (
                    <View className="">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text
                                className={`px-2 py-1 rounded-full text-base font-rubik-medium ${
                                    categoryColors[item.category] || categoryColors.Other
                                }`}
                            >
                                {item.category}
                            </Text>
                            <TouchableOpacity
                                className="flex flex-row gap-2 bg-primary-500 rounded-full px-5 py-2 items-center"
                                onPress={() => onEdit(item)}
                            >
                                <Edit size={16} color='#fff' />
                                <Text className="text-sm text-white font-rubik-medium">Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-center mb-4 flex justify-between">
                            <View className="flex flex-row justify-between items-center">
                                <IndianRupee size={18} color="#EA580C" />
                                <Text className="font-rubik-medium text-xl text-gray-800">
                                    {item.amount.toFixed(2)}
                                </Text>
                            </View>
                            <Text className="text-gray-700 font-rubik-medium">
                                {format(new Date(item.date), "MMM dd, yyyy")}
                            </Text>
                        </View>

                        {/* Description */}
                        <Text className="text-gray-600">{item.description}</Text>

                        {/* Vendor + Amount + Action */}
                        <View className="flex-row justify-between items-center mt-2">
                            <Text className="text-gray-500">{item.vendor || "-"}</Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );
}
