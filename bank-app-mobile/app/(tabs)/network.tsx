import { View, Text, StyleSheet } from "react-native";

export default function Network() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network</Text>
      <Text>Your network connections</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});
