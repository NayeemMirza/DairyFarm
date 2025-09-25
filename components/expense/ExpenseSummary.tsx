import React from "react";
import {View, Text, ScrollView} from "react-native";
import {DollarSign, IndianRupee} from "lucide-react-native";
import { ExpenseType } from "@/types/expance";

interface ExpenseSummaryProps {
    expenses: ExpenseType[];
    isLoading: boolean;
}

export default function ExpenseSummary({ expenses, isLoading }: ExpenseSummaryProps) {

    if (isLoading) {
        return (
            <View className="flex-col lg:flex-row gap-4 mb-6">
                <View className="h-40 bg-gray-200 rounded-2xl lg:flex-1" />
                <View className="h-40 bg-gray-200 rounded-2xl lg:flex-2" />
            </View>
        );
    }

    const COLORS: Record<string, string> = {
        Feed: "#4ade80", // green-400
        Medicine: "#f87171", // red-400
        Equipment: "#60a5fa", // blue-400
        Labor: "#c084fc", // purple-400
        Utilities: "#facc15", // yellow-400
        Maintenance: "#fb923c", // orange-400
        Transport: "#818cf8", // indigo-400
        Other: "#9ca3af", // gray-400
    };

    const expenseByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            <View className="">

            {/* Total Expenses Card */}
            <View className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 flex-1">
                <View className="flex-row items-center mb-2">
                    <IndianRupee size={20} color="red" />
                    <Text className="ml-2 text-lg font-bold">Total Expenses for current month</Text>
                </View>
                <Text className="text-4xl font-bold ">
                    <IndianRupee />{totalExpenses.toFixed(2)}
                </Text>
                <Text className="mt-1">For the selected period</Text>
            </View>

            {/* Category Breakdown Card - Only show if we have expenses */}
            {expenses.length > 0 && (
                <View className="bg-white rounded-2xl p-6 flex-1 border border-gray-200">
                    <Text className="text-lg font-bold mb-4">Expenses by Category</Text>
                    <View className="space-y-3">
                        {Object.entries(expenseByCategory)
                            .sort(([,a], [,b]) => b - a)
                            .map(([category, amount]) => (
                                <View key={category} className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <View
                                            className="w-3 h-3 rounded-full mr-2"
                                            style={{ backgroundColor: COLORS[category] || "#9ca3af" }}
                                        />
                                        <Text className="text-gray-700">{category}</Text>
                                    </View>
                                    <Text className="font-semibold">${amount.toFixed(2)}</Text>
                                </View>
                            ))
                        }
                    </View>
                </View>
            )}
        </View>
        </ScrollView>
    );
}