import React from "react";
import { View, ViewStyle } from "react-native";

interface ElectricBorderProps {
  children: React.ReactNode;
  color?: string;
  speed?: number;
  chaos?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function ElectricBorder({
  children,
  color = "#4CAF76",
  borderRadius = 24,
  style,
}: ElectricBorderProps) {
  return (
    <View
      style={[
        {
          borderRadius,
          borderWidth: 1.5,
          borderColor: color + "99",
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.65,
          shadowRadius: 14,
          elevation: 10,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
