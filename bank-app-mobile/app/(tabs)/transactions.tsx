import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deposit } from "../../api/transactions";

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["deposit"],
    mutationFn: () => {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return deposit(numAmount);
    },
    onSuccess: (data) => {
      console.log("Deposit successful:", data);
      // Invalidate and refetch user data to update balance
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      // Show success message
      Alert.alert(
        "Success",
        `Successfully deposited $${parseFloat(amount).toFixed(2)}`
      );
      // Clear the input
      setAmount("");
    },
    onError: (error: any) => {
      console.log("Deposit error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to deposit. Please try again.";
      Alert.alert("Deposit Failed", errorMsg);
    },
  });

  const handleDeposit = () => {
    const numAmount = parseFloat(amount);

    // Validation
    if (amount.trim() === "" || isNaN(numAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }

    if (numAmount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than $0");
      return;
    }

    // Call the mutation
    mutate();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Deposit Money</Text>
        <Text style={styles.subtitle}>Add money to your account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleDeposit}
          />
          <TouchableOpacity
            style={[
              styles.button,
              (isPending || !amount || parseFloat(amount) <= 0) &&
                styles.buttonDisabled,
            ]}
            onPress={handleDeposit}
            disabled={isPending || !amount || parseFloat(amount) <= 0}
          >
            <Text style={styles.buttonText}>
              {isPending ? "Processing..." : "Deposit"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
