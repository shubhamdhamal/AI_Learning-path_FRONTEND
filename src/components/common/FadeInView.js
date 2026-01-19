import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

const FadeInView = ({ children, style, delay = 0, duration = 600, slideDistance = 30 }) => {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(slideDistance); // Start slightly lower

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, {
            duration,
            easing: Easing.out(Easing.exp),
        }));
        translateY.value = withDelay(delay, withTiming(0, {
            duration,
            easing: Easing.out(Easing.exp),
        }));
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[style, animatedStyle]}>
            {children}
        </Animated.View>
    );
};

export default FadeInView;
