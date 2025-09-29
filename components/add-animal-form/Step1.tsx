import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Alert,
    TouchableWithoutFeedback,
    Keyboard, Modal
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import * as ImagePicker from "expo-image-picker";
import CustomInput from "@/components/CustomInput";
import images from "@/constants/images";
import { Picture, PictureSizes, ExtendedNewAnimalFormData } from "@/types/updatedTypes";

interface Step0Props {
    formData: ExtendedNewAnimalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ExtendedNewAnimalFormData>>;
    errors: { [key: string]: string };
}

const Step0BasicInfo: React.FC<Step0Props> = ({ formData, setFormData, errors }) => {
    const [animalAvatarPic, setAnimalAvatarPic] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (formData.picture_) {
            if (typeof formData.picture_ === 'string') {
                try {
                    const parsed = JSON.parse(formData.picture_);
                    setAnimalAvatarPic(Array.isArray(parsed) && parsed.length > 0 ? parsed[0].img_url : '');
                } catch {
                    setAnimalAvatarPic('');
                }
            } else if (typeof formData.picture_ === 'object' && 'url' in formData.picture_) {
                setAnimalAvatarPic(formData.picture_.url);
            } else {
                setAnimalAvatarPic('');
            }
        } else {
            setAnimalAvatarPic('');
        }
    }, [formData.picture_]);

    const handleInputChange = (field: keyof ExtendedNewAnimalFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission required", "Allow access to gallery.");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const newPicture: Picture = {
                ID: 0,
                id: 0,
                title: formData.name || "Animal Image",
                filename: localUri.split("/").pop() || "image.jpg",
                filesize: 0,
                url: localUri,
                link: localUri,
                alt: formData.name || "Animal Image",
                author: "",
                description: "",
                caption: "",
                name: formData.name || "Animal Image",
                status: "inherit",
                uploaded_to: 0,
                date: new Date().toISOString(),
                modified: new Date().toISOString(),
                menu_order: 0,
                mime_type: "image/jpeg",
                type: "image",
                subtype: "jpeg",
                icon: "",
                width: 0,
                height: 0,
                sizes: {} as PictureSizes,
            };

            setFormData(prev => ({
                ...prev,
                picture_: newPicture,
                pictureGallery: [...prev.pictureGallery, { img_url: localUri }]
            }));
        }

        setModalVisible(false);
    };

    const takePhoto = async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission required", "Allow access to camera.");

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
                title: formData.name || "Animal Image",
                filename: localUri.split("/").pop() || "image.jpg",
                filesize: 0,
                url: localUri,
                link: localUri,
                alt: formData.name || "Animal Image",
                author: "",
                description: "",
                caption: "",
                name: formData.name || "Animal Image",
                status: "inherit",
                uploaded_to: 0,
                date: new Date().toISOString(),
                modified: new Date().toISOString(),
                menu_order: 0,
                mime_type: "image/jpeg",
                type: "image",
                subtype: "jpeg",
                icon: "",
                width: 0,
                height: 0,
                sizes: {} as PictureSizes,
            };

            setFormData(prev => ({
                ...prev,
                picture_: newPicture,
                pictureGallery: [...prev.pictureGallery, { img_url: localUri }]
            }));
        }

        setModalVisible(false);
    };

    const pictureGallery = Array.isArray(formData.pictureGallery) ? formData.pictureGallery : [];

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <KeyboardAwareScrollView
                enableOnAndroid
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 80 }}
            >
                <View className="space-y-3 gap-3">
                    {/* Gallery */}
                    <Text className="text-gray-700 font-rubik-medium">Animal Pictures</Text>
                    <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-gray-700 font-rubik-medium">
                            Gallery ({pictureGallery.length})
                        </Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="bg-primary-500 px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white text-sm font-rubik">+ Add Photos</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="flex-row gap-3 flex-wrap">
                        {pictureGallery.length > 0 ? (
                            pictureGallery.map((item, idx) => (
                                <Image
                                    key={idx}
                                    source={{ uri: item.img_url }}
                                    className="w-24 h-24 rounded-xl"
                                    resizeMode="cover"
                                    onError={() => console.log("Gallery image error")}
                                />
                            ))
                        ) : (
                            <Text className="text-black-300 text-base font-rubik">No pictures available.</Text>
                        )}
                    </View>

                    {/* Avatar */}
                    <View className="flex flex-col relative mt-5">
                        <Image
                            source={
                                animalAvatarPic && (animalAvatarPic.startsWith("http") || animalAvatarPic.startsWith("file:"))
                                    ? { uri: animalAvatarPic }
                                    : images.avatarImg
                            }
                            className="size-44 relative rounded-full"
                            resizeMode="cover"
                            onError={() => setAnimalAvatarPic('')}
                        />
                        <TouchableOpacity className="absolute bottom-11 right-2" onPress={() => setModalVisible(true)}>
                            <View className="bg-primary-500 px-4 py-3 rounded-xl">
                                <Text className="text-white text-base font-rubik">
                                    {animalAvatarPic ? "Change Photo" : "Upload Photo"}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Inputs */}
                    <CustomInput
                        label="Name"
                        required
                        value={formData.name}
                        onChangeText={(t) => handleInputChange('name', t)}
                        error={errors.name}
                    />
                    <CustomInput
                        label="Color"
                        required
                        value={formData.color || ''}
                        onChangeText={(t) => handleInputChange('color', t)}
                        error={errors.color}
                    />
                    <CustomInput
                        label="Breed"
                        required
                        value={formData.breed || ''}
                        onChangeText={(t) => handleInputChange('breed', t)}
                        error={errors.breed}
                    />
                    <CustomInput
                        label="Milking Capacity"
                        required
                        value={formData.milkingCapacity?.toString() || ''}
                        onChangeText={(t) => handleInputChange('milkingCapacity', t)}
                        keyboardType="numeric"
                        error={errors.milkingCapacity}
                    />

                    {/* Modal for image picker */}
                    <Modal
                        animationType="slide"
                        transparent
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className="flex-1 justify-end">
                            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                                <View className="bg-black-950 opacity-50 w-full h-full absolute top-0 left-0" />
                            </TouchableWithoutFeedback>
                            <View className="bg-white rounded-t-3xl p-5 shadow-lg h-60">
                                <View className="flex-row gap-3">
                                    <TouchableOpacity onPress={pickImage} className="flex-1 border border-gray-400 rounded-xl p-3 items-center">
                                        <Text>📂 Gallery</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={takePhoto} className="flex-1 border border-gray-400 rounded-xl p-3 items-center">
                                        <Text>📸 Camera</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </KeyboardAwareScrollView>
        </TouchableWithoutFeedback>
    );
};

export default Step0BasicInfo;
