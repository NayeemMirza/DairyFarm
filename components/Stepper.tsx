import { View, Text } from "react-native";
import { Svg, Circle } from "react-native-svg";

interface Step {
    label: string;
}

interface StepperProps {
    steps: Step[] | string[];
    currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
    const getStepLabel = (step: Step | string) => {
        return typeof step === "string" ? step : step.label;
    }
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = currentStep / (steps.length - 1);
    const strokeDashoffset = circumference - (progress * circumference);
    return (
        <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-2xl font-rubik text-black-950">
                    {getStepLabel(steps[currentStep])}
                </Text>

                <Text className="text-base text-black-900">
                    {currentStep + 1 < steps.length
                        && 'Next: '}
                    {currentStep + 1 < steps.length
                        && getStepLabel(steps[currentStep + 1])}
                </Text>
            </View>
            <View className="w-36 h-36 items-center justify-center">
                <Svg width="100%" height="100%" viewBox="0 0 100 100">
                    <Circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#E5E7EB" // gray-200
                        strokeWidth="6"
                        fill="transparent"
                    />
                    <Circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#3B82F6" // primary-500
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        transform="rotate(-90 50 50)"
                    />
                </Svg>
                <View className="absolute">
                    <Text className="text-center text-black-900 font-bold text-2xl">
                        {currentStep + 1} of {steps.length}
                    </Text>
                </View>
            </View>
        </View>
    );
}
