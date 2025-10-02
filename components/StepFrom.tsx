import {
    View,
    Text,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    ScrollView,
    Platform,
    KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard
} from "react-native";
import React, {useEffect, useState} from "react";
import Dropdown from "@/components/dropdown";
import { animalTypeList, calfGenderList, calvingList } from "@/constants/data";
import images from "@/constants/images";
import CustomInput from "@/components/CustomInput";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {ExtendedNewAnimalFormData, Picture, PictureSizes} from "@/types/updatedTypes";
import icons from "@/constants/icons";
import avatarImg from "@/assets/images/avatar-img.png";
import {formatDisplayDate, getDateValue} from "@/utils/utils";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";

interface StepFormProps {
    step: number;
    formData: ExtendedNewAnimalFormData;
    setFormData: React.Dispatch<React.SetStateAction<ExtendedNewAnimalFormData>>;
    onValidationChange?: (isValid: boolean) => void;
}

export default function StepForm({ step, formData, setFormData, onValidationChange }: StepFormProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [currentField, setCurrentField] = useState<keyof ExtendedNewAnimalFormData | null>(null);
    const [animalAvatarPic, setAnimalAvatarPic] = useState('')
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const newErrors: { [key: string]: string } = {};

        // Step-wise validation
        switch (step) {
            case 0:
                if (!formData.name?.trim()) {
                    newErrors.name = "Name is required";
                }
                if (!formData.color?.trim()) {
                    newErrors.breed = "Color is required";
                }
                if (!formData.breed?.trim()) {
                    newErrors.breed = "Breed is required";
                }
                if (!formData.milkingCapacity?.toString().trim()) {
                    newErrors.milkingCapacity = "Milking Capacity is required";
                }
                break;

            case 1:
                // Example: purchase info step
                if (!formData.buy_date?.trim()) {
                    newErrors.purchaseAmount = "Purchase Date is required";
                }
                if (!formData.purchaseAmount?.trim()) {
                    newErrors.purchaseAmount = "Purchase Amount is required";
                }
                if (!formData.buy_date) {
                    newErrors.buy_date = "Purchase Date is required";
                }
                break;

            case 2:
                // Example: pregnancy info step
                if (formData.isPregnant && !formData.conceive_date) {
                    newErrors.conceive_date = "Conceive Date is required";
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);

        // Notify parent if validation passes
        if (onValidationChange) {
            onValidationChange(Object.keys(newErrors).length === 0);
        }
    }, [formData, step, onValidationChange]);


    // Input handler
    const handleInputChange = (field: keyof ExtendedNewAnimalFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Toggle Pregnant
    const togglePregnant = () => {
        setFormData(prev => ({
            ...prev,
            isPregnant: !prev.isPregnant,
            // if switching OFF, clear conceive_date
            conceive_date: !prev.isPregnant ? prev.conceive_date : undefined,
        }));
    };

// Toggle Dry
    const toggleDry = () => {
        setFormData(prev => {
            return {
                ...prev,
                isDry: !prev.isDry,
            };
        });
    };
    const toggleHasCalf = () => {
        setFormData(prev => ({
            ...prev,
            hasCalf: !prev.hasCalf,
            calf_tag_no: !prev.hasCalf ? '' : undefined
        }));
    };

    // Date Picker
    const showDatePicker = (field: keyof ExtendedNewAnimalFormData) => {
        setCurrentField(field);
        setShowPicker(true);
    };

    const handleDateChange = (_: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate && currentField) {
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            setFormData(prev => ({ ...prev, [currentField]: formattedDate }));
        }
    };

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

    // Image Picker
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert("Permission required", "Allow access to gallery.");

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
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
                pictureGallery: [...prev.pictureGallery, { img_url: localUri }] // optional gallery
            }));
        }
        setModalVisible(false)
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
            setFormData(prev => {
                const animalAvatar = prev.picture_ === "string" ? JSON.parse(prev.picture_) : [];
                const updatedAnimalAvatar = JSON.stringify([...animalAvatar, { img_url: result.assets[0].uri }]);
                return { ...prev, picture_: updatedAnimalAvatar };
            });
        }
        setModalVisible(false)
    };

    const getParsedPictureGallery = (): any[] => {
        try {
            return Array.isArray(formData.pictureGallery) ? formData.pictureGallery : [];

        } catch {
            return [];
        }
    };

    return (
        <View className="flex-1">
            {showPicker && currentField && (
                <DateTimePicker
                    value={getDateValue(currentField, formData)}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}

            {(() => {
                switch (step) {
                    case 0: // Basic info + pictures
                        const pictureGallery = getParsedPictureGallery();
                        return (
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <KeyboardAwareScrollView
                                    enableOnAndroid={true}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ paddingBottom: 80 }}
                                >
                                    <View className="space-y-3 gap-3">
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
                                            pictureGallery.map((item: any, idx: number) => (
                                                <Image
                                                    key={idx}
                                                    source={{ uri: item.img_url }}
                                                    className="w-24 h-24 rounded-xl"
                                                    onError={(e) => console.log('Gallery image error:', e.nativeEvent.error)}
                                                    resizeMode="cover"
                                                />
                                            ))
                                        ) : (
                                            <Text className="text-black-300 text-base font-rubik">No pictures available.</Text>
                                        )}
                                    </View>
                                        <View className="flex flex-col relative mt-5">
                                            <Image
                                                source={
                                                    animalAvatarPic && animalAvatarPic.startsWith('http') || animalAvatarPic.startsWith('file:')
                                                        ? { uri: animalAvatarPic }
                                                        : images.avatarImg
                                                }
                                                className="size-44 relative rounded-full"
                                                onError={() => setAnimalAvatarPic('')}
                                                resizeMode="cover"
                                            />
                                            <TouchableOpacity className="absolute bottom-11 right-2" onPress={() => setModalVisible(true)}>
                                                <View className="bg-primary-500 px-4 py-3 rounded-xl">
                                                    <Text className="text-white text-base font-rubik">
                                                        {animalAvatarPic ? "Change Photo" : "Upload Photo"}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                    <CustomInput
                                        label="Name"
                                        required={true}
                                        value={formData.name}
                                        onChangeText={(t) => handleInputChange('name', t)}
                                    />
                                    <CustomInput
                                        label="Color"
                                        value={formData.color || ''}
                                        required={true}
                                        onChangeText={(t) => handleInputChange('color', t)}
                                    />
                                    <CustomInput
                                        label="Breed"
                                        required={true}
                                        value={formData.breed || ''}
                                        onChangeText={(t) => handleInputChange('breed', t)}
                                    />
                                    <CustomInput
                                        label="Milking Capacity"
                                        value={formData.milkingCapacity?.toString() || ''}
                                        onChangeText={(t) => handleInputChange('milkingCapacity', t)}
                                        keyboardType="numeric"
                                        required={true}
                                    />
                                </View>
                                </KeyboardAwareScrollView>
                            </TouchableWithoutFeedback>
                        );

                    case 1: // Purchase info
                        return (
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                                <KeyboardAwareScrollView
                                    enableOnAndroid={true}
                                    keyboardShouldPersistTaps="handled"
                                    contentContainerStyle={{ paddingBottom:0 }}
                                >
                            <View className="space-y-3 gap-3">
                                <Text className="text-gray-700 font-rubik-medium">Purchase Date <Text className="text-red-500">*</Text></Text>
                                <TouchableOpacity
                                    onPress={() => showDatePicker("buy_date")}
                                    className="border border-gray-300 rounded-xl px-3 py-2 flex-row justify-between items-center"
                                >
                                    <Text>{formData.buy_date}</Text>
                                </TouchableOpacity>

                                <CustomInput
                                    label="Purchase Amount"
                                    value={formData.purchaseAmount || ''}
                                    onChangeText={(t) => handleInputChange('purchaseAmount', t)}
                                    keyboardType="numeric"
                                    required={true}
                                />
                                <Dropdown
                                    label="Animal Type"
                                    options={animalTypeList}
                                    selectedValue={formData.animalType || ''}
                                    onValueChange={(v) => handleInputChange("animalType", v)}
                                />
                                <Dropdown
                                    label="Calving"
                                    options={calvingList}
                                    selectedValue={formData.calving?.toString() || ''}
                                    onValueChange={(v) => handleInputChange("calving", v)}
                                />
                            </View>
                                </KeyboardAwareScrollView>
                            </TouchableWithoutFeedback>
                        );

                    case 2: // Pregnant / Dry
                        return (
                            <View className="space-y-4 gap-3">
                                {/* Pregnant */}
                                <TouchableOpacity
                                    onPress={togglePregnant}
                                    className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
                                >
                                    <Text className="text-gray-700 font-rubik-medium">Pregnant</Text>
                                    <View
                                        className={`px-3 py-1 rounded-full ${
                                            formData.isPregnant ? "bg-green-100" : "bg-red-100"
                                        }`}
                                    >
                                        <Text
                                            className={`font-rubik font-medium ${
                                                formData.isPregnant ? "text-green-700" : "text-red-600"
                                            }`}
                                        >
                                            {formData.isPregnant ? "✔ Yes" : "✕ No"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {/* Conceive Date (only if Pregnant) */}
                                {formData.isPregnant && (
                                    <TouchableOpacity
                                        onPress={() => showDatePicker("conceive_date")}
                                        className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
                                    >
                                        <Text className="text-gray-700 font-rubik-medium">Conceive Date</Text>
                                        <Text
                                            className={`font-rubik font-medium ${
                                                formData.conceive_date ? "text-gray-900" : "text-gray-400"
                                            }`}
                                        >
                                            {formData.conceive_date
                                                ? formatDisplayDate(formData.conceive_date)
                                                : "Add Conceive Date"}
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {/* Dry */}
                                <TouchableOpacity
                                    onPress={toggleDry}
                                    className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
                                >
                                    <Text className="text-gray-700 font-rubik-medium">Dry</Text>
                                    <View
                                        className={`px-3 py-1 rounded-full ${
                                            formData.isDry ? "bg-green-100" : "bg-red-100"
                                        }`}
                                    >
                                        <Text
                                            className={`font-rubik font-medium ${
                                                formData.isDry ? "text-green-700" : "text-red-600"
                                            }`}
                                        >
                                            {formData.isDry ? "✔ Yes" : "✕ No"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        );

                    case 3: // Calves
                        return (
                            <View className="space-y-4 gap-3">
                                <TouchableOpacity
                                    onPress={toggleHasCalf}
                                    className="border border-gray-300 flex-row justify-between items-center bg-white rounded-xl px-4 py-4"
                                >
                                    <Text className="text-gray-700 font-rubik-medium">Has Calf</Text>
                                    <View
                                        className={`px-3 py-1 rounded-full ${
                                            formData.hasCalf ? "bg-green-100" : "bg-red-100"
                                        }`}
                                    >
                                        <Text
                                            className={`font-rubik font-medium ${
                                                formData.hasCalf ? "text-green-700" : "text-red-600"
                                            }`}
                                        >
                                            {formData.hasCalf ? "✔ Yes" : "✕ No"}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                {formData.hasCalf && (
                                    <View className="space-y-4 gap-3">
                                        <Dropdown
                                            label="Calf Gender"
                                            options={calfGenderList}
                                            selectedValue={formData.calfgender || ''}
                                            onValueChange={(v) => handleInputChange("calfgender", v)}
                                        />
                                        <CustomInput
                                            label="Calf Tag No"
                                            value={formData.calf_tag_no || ''}
                                            onChangeText={(t) => handleInputChange("calf_tag_no", t)}
                                        />
                                    </View>
                                )}
                            </View>
                        );

                    case 4: // Review
                        return (
                            <View className="p-3 bg-gray-100 rounded-xl">
                                <Text className="text-lg font-semibold mb-2">Review Info</Text>
                                <Text>{JSON.stringify(formData, null, 2)}</Text>
                            </View>
                        );

                    default:
                        return null;
                }
            })()}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1, justifyContent: "flex-end" }}
                    keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
                >
                    <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                        <View className="bg-black-950 opacity-50 w-full h-full absolute top-0 left-0" />
                    </TouchableWithoutFeedback>
                <View className="bg-white rounded-t-3xl p-5 shadow-lg h-60">
                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        keyboardShouldPersistTaps="handled"
                    >
                <View className="flex-row gap-3">
                    <TouchableOpacity onPress={pickImage} className="flex-1 border border-gray-400 rounded-xl p-3 items-center">
                        <Text>📂 Gallery</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={takePhoto} className="flex-1 border border-gray-400 rounded-xl p-3 items-center">
                        <Text>📸 Camera</Text>
                    </TouchableOpacity>
                </View>
                    </ScrollView>
                </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}