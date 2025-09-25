import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    Modal
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import images from "@/constants/images";

interface Picture {
    ID?: number;
    id?: number;
    title?: string;
    filename?: string;
    filesize?: number;
    url: string;
    link?: string;
    alt?: string;
    author?: string;
    description?: string;
    caption?: string;
    name?: string;
    status?: string;
    uploaded_to?: number;
    date?: string;
    modified?: string;
    menu_order?: number;
    mime_type?: string;
    type?: string;
    subtype?: string;
    icon?: string;
    width?: number;
    height?: number;
    sizes?: any;
}

interface ImagePickerComponentProps {
    label?: string;
    mainPicture?: Picture | null;
    gallery?: { img_url: string }[];
    setMainPicture?: (pic: Picture) => void;
    setGallery?: (pics: { img_url: string }[]) => void;
    avatarSize?: number; // optional, default 100
    galleryItemSize?: number; // optional, default 80
}

const ImagePickerComponent: React.FC<ImagePickerComponentProps> = ({
                                                                       label = "Pictures",
                                                                       mainPicture,
                                                                       gallery = [],
                                                                       setMainPicture,
                                                                       setGallery,
                                                                       avatarSize = 100,
                                                                       galleryItemSize = 80,
                                                                   }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isMainPicture, setIsMainPicture] = useState(false);

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted)
            return Alert.alert("Permission required", "Allow access to gallery.");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: !isMainPicture
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            const localUri = asset.uri;

            const newPicture: Picture = {
                ID: 0,
                id: 0,
                title: "Image",
                filename: localUri.split("/").pop() || "image.jpg",
                filesize: 0,
                url: localUri,
                link: localUri,
                alt: "Image",
                name: "Image",
                status: "inherit",
                date: new Date().toISOString(),
                modified: new Date().toISOString(),
                type: "image",
                subtype: "jpeg",
                mime_type: "image/jpeg",
                sizes: {}
            };

            if (isMainPicture && setMainPicture) {
                setMainPicture(newPicture);
            } else if (!isMainPicture && setGallery) {
                setGallery([...gallery, { img_url: localUri }]);
            }
        }
        setModalVisible(false);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted)
            return Alert.alert("Permission required", "Allow access to camera.");

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;

            const newPicture: Picture = {
                ID: 0,
                id: 0,
                title: "Image",
                filename: localUri.split("/").pop() || "image.jpg",
                filesize: 0,
                url: localUri,
                link: localUri,
                alt: "Image",
                name: "Image",
                status: "inherit",
                date: new Date().toISOString(),
                modified: new Date().toISOString(),
                type: "image",
                subtype: "jpeg",
                mime_type: "image/jpeg",
                sizes: {}
            };

            if (isMainPicture && setMainPicture) {
                setMainPicture(newPicture);
            } else if (!isMainPicture && setGallery) {
                setGallery([...gallery, { img_url: localUri }]);
            }
        }
        setModalVisible(false);
    };

    return (
        <View className="space-y-3">
            {label && <Text className="text-gray-700 font-rubik-medium">{label}</Text>}

            {/* Gallery */}
            {setGallery && (
                <>
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-700 font-rubik-medium">Gallery ({gallery.length})</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setIsMainPicture(false);
                                setModalVisible(true);
                            }}
                            className="bg-primary-500 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white text-sm font-rubik">+ Add Photos</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-3 flex-wrap">
                        {gallery.length > 0 ? (
                            gallery.map((item, idx) => (
                                <Image
                                    key={idx}
                                    source={{ uri: item.img_url }}
                                    className={`rounded-xl`}
                                    style={{ width: galleryItemSize, height: galleryItemSize }}
                                    resizeMode="cover"
                                    onError={() => console.log("Gallery image error")}
                                />
                            ))
                        ) : (
                            <Text className="text-gray-400 text-base font-rubik">No pictures available.</Text>
                        )}
                    </View>
                </>
            )}

            {/* Main Picture / Avatar */}
            {setMainPicture && (
                <View className="flex flex-col relative mt-5">
                    <Image
                        source={
                            mainPicture?.url.startsWith("http") || mainPicture?.url.startsWith("file:")
                                ? { uri: mainPicture.url }
                                : images.avatarImg
                        }
                        style={{ width: avatarSize, height: avatarSize }}
                        className="rounded-full"
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        className="absolute bottom-0 right-0"
                        onPress={() => {
                            setIsMainPicture(true);
                            setModalVisible(true);
                        }}
                    >
                        <View className="bg-primary-500 px-4 py-2 rounded-xl">
                            <Text className="text-white text-base font-rubik">
                                {mainPicture ? "Change Photo" : "Upload Photo"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Modal */}
            <Modal transparent visible={modalVisible} animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white p-5 rounded-t-xl">
                        <Text className="text-lg font-rubik-medium mb-4">Select Option</Text>

                        <TouchableOpacity onPress={pickImage} className="py-3">
                            <Text className="text-primary-500 font-rubik text-base">Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={takePhoto} className="py-3">
                            <Text className="text-primary-500 font-rubik text-base">Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setModalVisible(false)} className="py-3 mt-2">
                            <Text className="text-gray-500 font-rubik text-base text-center">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ImagePickerComponent;
