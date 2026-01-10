import { View, Text, StyleSheet } from "react-native";
import { Link } from "expo-router";

export default function Register() {
  return (
    <View style={styles.container}>
      <Text>Register Screen</Text>
      <Link href="./home">Go to Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
