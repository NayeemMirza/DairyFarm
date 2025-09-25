import React from "react";
import { View, Text } from "react-native";
import { format, subDays } from "date-fns";
import { BarChart } from "react-native-gifted-charts";

interface MilkRecord {
    date: string;
    total_yield: number;
}

interface MilkProductionBarChartProps {
    milkRecords: MilkRecord[];
    isLoading?: boolean;
}

export default function MilkProductionBarChart({
                                                   milkRecords,
                                                   isLoading = false,
                                               }: MilkProductionBarChartProps) {
    // Generate last 7 days chart data
    const generateChartData = () => {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = subDays(new Date(), i);
            const dateStr = format(date, "yyyy-MM-dd");
            const dayRecords = milkRecords.filter((r) => r.date === dateStr);
            const totalYield = dayRecords.reduce((sum, r) => sum + r.total_yield, 0);

            last7Days.push({
                value: totalYield,
                label: format(date, "MMM dd"),
                frontColor: "#3b82f6",
                showValue: true,
            });
        }
        return last7Days;
    };

    const chartData = generateChartData();

    return (
        <View className="bg-white/80 rounded-xl p-6 shadow-lg mb-4">
            <Text className="text-gray-800 text-xl font-bold mb-4">
                Milk Production (Last 7 Days)
            </Text>

            {isLoading ? (
                <View className="h-64 w-full bg-gray-300 rounded" />
            ) : (
                <BarChart
                    data={chartData}
                    width={280}
                    height={200}
                    spacing={15}
                    barBorderRadius={6}
                    initialSpacing={10}
                    yAxisThickness={0} // optional: hide left axis line
                    yAxisTextStyle={{ color: "#6b7280", fontSize: 12 }} // correct prop for Y-axis labels
                    xAxisLabelTextStyle={{ color: "#6b7280", fontSize: 12 }}
                    showVerticalLines={false}
                    isAnimated
                    animationDuration={800}
                />
            )}
        </View>
    );
}
