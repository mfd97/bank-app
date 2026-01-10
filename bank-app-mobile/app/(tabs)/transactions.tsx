import { View, Text, StyleSheet } from "react-native";

export default function Transactions() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions</Text>
      <Text>Your transaction history will appear here</Text>
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
