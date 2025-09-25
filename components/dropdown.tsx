import React, { FC } from "react";
import { View, Text, Image } from "react-native";
import { Dropdown as ElementDropdown } from "react-native-element-dropdown";

interface DropdownOption {
    name: string;
    value: string;
    image?: string; // optional
}

interface DropdownProps {
    options: DropdownOption[];
    selectedValue?: string;
    onValueChange?: (value: string) => void;
    label: string;
}

const Dropdown: FC<DropdownProps> = ({
                                         options,
                                         selectedValue,
                                         onValueChange,
                                         label,
                                     }) => {
    // Find selected item (to show image in left icon)
    const selectedItem = options.find((opt) => opt.value === selectedValue);

    return (
        <View className="w-full">
            <Text className="text-gray-700 font-rubik-medium mb-1">{label}</Text>

            <ElementDropdown
                style={{
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                }}
                data={options}
                search
                labelField="name"
                valueField="value"
                placeholder="Select an option"
                searchPlaceholder="Search..."
                value={selectedValue}
                onChange={(item) => onValueChange?.(item.value)}
                renderItem={(item) => (
                    <View className="flex-row items-center p-2">
                        {item.image ? (
                            <Image
                                source={{ uri: item.image }}
                                className="w-8 h-8 rounded-full mr-2"
                            />
                        ) : (
                            <View className="w-8 h-8 mr-2" /> // placeholder space
                        )}
                        <Text className="text-gray-800">{item.name}</Text>
                    </View>
                )}
                renderLeftIcon={() =>
                    selectedItem?.image ? (
                        <Image
                            source={{ uri: selectedItem.image }}
                            className="w-12 h-12 rounded-full mr-2"
                        />
                    ) : null
                }
            />
        </View>
    );
};

export default Dropdown;
