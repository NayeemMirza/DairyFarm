import React from "react";
import { View } from "react-native";

interface SkeletonProps {
    className?: string; // optional Tailwind classes
    style?: object;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, style }) => {
    return (
        <View
            className={className || "bg-gray-300 rounded"}
            style={[{ height: 20, width: 80 }, style]}
        />
    );
};
