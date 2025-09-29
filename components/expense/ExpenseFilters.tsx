import React, {useEffect, useState} from "react";
import { View, Text, Modal, TouchableOpacity, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import {Calendar, X} from 'lucide-react-native' ;

interface ExpenseFiltersProps {
    onFilterChange: React.Dispatch<React.SetStateAction<{ category: string; month: string }>>;
    currentFilters: { month: string; category: string };
    categories: string[];
}

export default function ExpenseFilters({
       onFilterChange,
       currentFilters,
       categories,
   }: ExpenseFiltersProps) {
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

    const handleFilterChange = (type: string, value: string) => {
        onFilterChange((prev) => ({ ...prev, [type]: value }));
    };

    const handleMonthSelect = () => {
        const monthValue = `${selectedYear}-${selectedMonth.toString().padStart(2, "0")}`;
        handleFilterChange("month", monthValue);
        setShowMonthPicker(false);
    };

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
    const months = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    // Parse current month for initial values
    useEffect(() => {
        if (currentFilters.month && currentFilters.month !== "all") {
            const [year, month] = currentFilters.month.split("-");
            setSelectedYear(parseInt(year));
            setSelectedMonth(parseInt(month));
        }
    }, [currentFilters.month]);

    return (
        <View className="flex flex-row w-full space-x-3 gap-3">
            {/* Month Filter */}
            <View className="flex-1 flex flex-col gap-1">
                <Text className="text-base font-rubik-medium text-gray-900">Month</Text>
                <TouchableOpacity
                    className="border border-gray-300 rounded-lg px-3 py-5 flex flex-row justify-between"
                    onPress={() => setShowMonthPicker(true)}
                >
                    <Text className="text-gray-900">
                        {currentFilters.month && currentFilters.month !== "all"
                            ? currentFilters.month
                            : "Select Month"}
                    </Text>
                    <Calendar size={18} />
                </TouchableOpacity>

                <Modal
                    visible={showMonthPicker}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => setShowMonthPicker(false)}
                >
                    <TouchableOpacity
                        className="flex-1 justify-end"
                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                        activeOpacity={1}
                        onPressOut={() => setShowMonthPicker(false)}
                    >
                        <View className="bg-white rounded-t-3xl p-5" onStartShouldSetResponder={() => true}>
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-lg font-bold">Select Month</Text>
                                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                                    <Text className="text-blue-500 text-lg">Done</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1">
                                    <Text className="font-medium mb-2">Year</Text>
                                    <Picker
                                        selectedValue={selectedYear}
                                        onValueChange={setSelectedYear}
                                    >
                                        {years.map(year => (
                                            <Picker.Item key={year} label={year.toString()} value={year} />
                                        ))}
                                    </Picker>
                                </View>

                                <View className="flex-1">
                                    <Text className="font-medium mb-2">Month</Text>
                                    <Picker
                                        selectedValue={selectedMonth}
                                        onValueChange={setSelectedMonth}
                                    >
                                        {months.map(month => (
                                            <Picker.Item key={month.value} label={month.label} value={month.value} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>

            {/* Category Filter */}
            <View className="flex-1 flex flex-col gap-1">
                <Text className="text-base font-rubik-medium text-gray-900">Category</Text>
                <View className="border border-gray-300 rounded-lg justify-center px-2">
                    <Picker
                        selectedValue={currentFilters.category}
                        onValueChange={(value) => handleFilterChange("category", value)}
                    >
                        <Picker.Item label="All Categories" value="all" />
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>
            </View>
        </View>
    );
}