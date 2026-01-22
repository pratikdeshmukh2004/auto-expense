import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface CoinConfig {
  symbol: string;
  color: string;
  borderColor: string;
  size?: number;
  fontSize?: number;
  left: string;
  delay: number;
  isGold?: boolean;
}

const defaultCoins: CoinConfig[] = [
  { symbol: '$', color: '#FFD700', borderColor: '#FFF', left: '20%', delay: 0 },
  { symbol: '€', color: '#4CAF50', borderColor: '#66BB6A', left: '70%', delay: 800 },
  { symbol: '¥', color: '#FF9800', borderColor: '#FFB74D', size: 35, fontSize: 18, left: '40%', delay: 1600 },
  { symbol: '£', color: '#2196F3', borderColor: '#42A5F5', size: 38, fontSize: 20, left: '85%', delay: 2400 },
  { symbol: '₹', color: '#9C27B0', borderColor: '#BA68C8', size: 33, fontSize: 17, left: '10%', delay: 3200 },
  { symbol: '◉', color: '#FFD700', borderColor: '#FFA500', size: 42, fontSize: 28, left: '55%', delay: 4000, isGold: true },
];

interface AnimatedCoinsProps {
  coins?: CoinConfig[];
}

export default function AnimatedCoins({ coins = defaultCoins }: AnimatedCoinsProps) {
  const animatedValues = useRef(coins.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animatedValues.map((value, index) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(coins[index].delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    });

    Animated.parallel(animations).start();
  }, []);

  return (
    <>
      {coins.map((coin, index) => {
        const animatedValue = animatedValues[index];
        const size = coin.size || 36;
        const fontSize = coin.fontSize || 18;

        return (
          <Animated.View
            key={index}
            style={[
              styles.coin,
              { left: coin.left },
              {
                transform: [
                  {
                    translateY: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1000, -150],
                    }),
                  },
                ],
                opacity: animatedValue.interpolate({
                  inputRange: [0, 0.2, 0.8, 1],
                  outputRange: [0, 0.4, 0.4, 0],
                }),
              },
            ]}
          >
            <View
              style={[
                styles.coinShape,
                {
                  backgroundColor: coin.color,
                  borderColor: coin.borderColor,
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                },
                coin.isGold && styles.goldCoin,
              ]}>
              <Text style={[styles.coinSymbol, { fontSize }, coin.isGold && styles.goldSymbol]}>
                {coin.symbol}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    zIndex: 0,
  },
  coinShape: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  coinSymbol: {
    fontWeight: 'bold',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  goldCoin: {
    backgroundColor: '#FFD700',
    borderWidth: 5,
    borderColor: '#FFA500',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 12,
  },
  goldSymbol: {
    color: '#B8860B',
    textShadowColor: '#FFA500',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
});
