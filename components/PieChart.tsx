import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const PieChart = ({ size = 144, strokeWidth = 12, data }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const animatedValues = useRef(data.map(() => new Animated.Value(0))).current;
  
  useEffect(() => {
    const animations = animatedValues.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 1000,
        delay: index * 300,
        useNativeDriver: false,
      })
    );
    
    Animated.stagger(300, animations).start();
  }, []);
  
  let cumulativePercentage = 0;
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size/2}, ${size/2}`}>
          {data.map((item, index) => {
            const strokeDasharray = `${item.percentage * circumference / 100} ${circumference}`;
            const strokeDashoffset = -cumulativePercentage * circumference / 100;
            
            cumulativePercentage += item.percentage;
            
            return (
              <AnimatedCircle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [`0 ${circumference}`, strokeDasharray]
                })}
                strokeDashoffset={strokeDashoffset}
                fill="transparent"
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

export default PieChart;