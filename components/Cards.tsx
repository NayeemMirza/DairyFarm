import icons from "@/constants/icons";
import images from "@/constants/images";
import { Image, Text, TouchableOpacity, View } from "react-native";
import {Animal, AnimalCardObject} from "@/types/types";
import cowImage from "@/assets/images/cow.png";



interface Props {
    item: Animal;
    onPress?: () => void;
}

export const FeaturedCard = ({ item, onPress }: Props) => {
    if (!item) {
        return null; // or a skeleton/placeholder
    }
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex flex-col items-start w-60 h-80 relative"
        >
            {(item?.acf?.picture_?.url && item?.acf?.picture_?.url !== undefined) ? (
                <Image source={{uri: item?.acf?.picture_?.url}} className="size-full rounded-2xl" />
            ) : (
                <Image source={images.cowImage} className="size-full rounded-2xl" />
            )}
            <Image
                source={images.cardGradient}
                className="size-full rounded-2xl absolute bottom-0"
            />

            {item?.acf?.milking_capacity && (
                <View className="flex flex-row items-center bg-white/90 px-3 py-1.5 rounded-full absolute top-5 right-5">
                    <Image source={icons.star} className="size-3.5" />
                    <Text className="text-xs font-rubik-bold text-primary-300 ml-1">
                        {item?.acf?.milking_capacity} L
                    </Text>
                </View>
            )}

            <View className="flex flex-col items-start absolute bottom-5 inset-x-5">
                <Text
                    className="text-xl font-rubik-extrabold text-white"
                    numberOfLines={1}
                >
                    {item?.acf?.name || ""}
                </Text>
                <Text className="text-base font-rubik text-white" numberOfLines={1}>
                    {item?.acf?.breeds || ""}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export const Card = ({ item, onPress }: Props) => {
    return (
        <TouchableOpacity
            className="flex-1 w-full mt-4 px-3 py-4 rounded-lg bg-white shadow-lg shadow-black-100/70 relative"
            onPress={onPress}
        >
                <View className="flex flex-row items-center absolute px-2 top-5 right-5 bg-white/90 p-1 rounded-full z-50">
                    <Image source={icons.star} className="size-2.5" />
                    <Text className="text-xs font-rubik-bold text-primary-300 ml-0.5">
                        {item?.acf?.milking_capacity ?? ''} L
                    </Text>
                </View>
            {(item?.acf?.picture_?.url && item?.acf?.picture_?.url !== undefined) ? (
                <Image source={{uri: item?.acf?.picture_?.url}} className="w-full h-48 rounded-lg" />
            ) : (
                <Image source={images.cowImage} className="w-full h-48 rounded-lg" />
            )}
            <View className="flex flex-col mt-2">
                <Text className="text-base font-rubik-bold text-primary-500">
                    {item?.acf?.name}
                </Text>
                <Text className="text-xs font-rubik text-black-950">
                    {item?.acf?.breeds}
                </Text>
            </View>
        </TouchableOpacity>
    );
};
