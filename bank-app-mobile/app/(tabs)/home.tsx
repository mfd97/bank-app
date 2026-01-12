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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deposit, withdraw } from "../../api/transactions";
import { getMe } from "../../api/auth";

export default function HomeScreen() {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
  });

  const currentBalance = currentUser?.data?.balance || 0;

  const { mutate: depositMutate, isPending: isDepositPending } = useMutation({
    mutationKey: ["deposit"],
    mutationFn: () => {
      const numAmount = parseFloat(depositAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return deposit(numAmount);
    },
    onSuccess: (data) => {
      console.log("Deposit successful:", data);
      // Refetch user data immediately to update balance in all screens
      queryClient.refetchQueries({ queryKey: ["user", "me"] });
      queryClient.refetchQueries({ queryKey: ["users", "all"] });
      // Show success message
      Alert.alert(
        "Success",
        `Successfully deposited $${parseFloat(depositAmount).toFixed(2)}`
      );
      // Clear the input
      setDepositAmount("");
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

  const { mutate: withdrawMutate, isPending: isWithdrawPending } = useMutation({
    mutationKey: ["withdraw"],
    mutationFn: () => {
      const numAmount = parseFloat(withdrawAmount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return withdraw(numAmount);
    },
    onSuccess: (data) => {
      console.log("Withdrawal successful:", data);
      // Refetch user data immediately to update balance in all screens
      queryClient.refetchQueries({ queryKey: ["user", "me"] });
      queryClient.refetchQueries({ queryKey: ["users", "all"] });
      // Show success message
      Alert.alert(
        "Success",
        `Successfully withdrew $${parseFloat(withdrawAmount).toFixed(2)}`
      );
      // Clear the input
      setWithdrawAmount("");
    },
    onError: (error: any) => {
      console.log("Withdrawal error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to withdraw. Please try again.";
      Alert.alert("Withdrawal Failed", errorMsg);
    },
  });

  const handleDeposit = () => {
    const numAmount = parseFloat(depositAmount);

    // Validation
    if (depositAmount.trim() === "" || isNaN(numAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }

    if (numAmount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than $0");
      return;
    }

    // Call the mutation
    depositMutate();
  };

  const handleWithdraw = () => {
    const numAmount = parseFloat(withdrawAmount);

    // Validation
    if (withdrawAmount.trim() === "" || isNaN(numAmount)) {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }

    if (numAmount <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than $0");
      return;
    }

    if (numAmount > currentBalance) {
      Alert.alert(
        "Insufficient Balance",
        `You only have $${currentBalance.toFixed(
          2
        )}. Cannot withdraw $${numAmount.toFixed(2)}.`
      );
      return;
    }

    // Call the mutation
    withdrawMutate();
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
            value={depositAmount}
            onChangeText={setDepositAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleDeposit}
          />
          <TouchableOpacity
            style={[
              styles.button,
              (isDepositPending ||
                !depositAmount ||
                parseFloat(depositAmount) <= 0) &&
                styles.buttonDisabled,
            ]}
            onPress={handleDeposit}
            disabled={
              isDepositPending ||
              !depositAmount ||
              parseFloat(depositAmount) <= 0
            }
          >
            <Text style={styles.buttonText}>
              {isDepositPending ? "Processing..." : "Deposit"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Withdraw Section */}
        <View style={styles.divider} />

        <Text style={styles.title}>Withdraw Money</Text>
        <Text style={styles.subtitle}>Remove money from your account</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            placeholderTextColor="#999"
            value={withdrawAmount}
            onChangeText={setWithdrawAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleWithdraw}
          />
          <TouchableOpacity
            style={[
              styles.button,
              styles.withdrawButton,
              (isWithdrawPending ||
                !withdrawAmount ||
                parseFloat(withdrawAmount) <= 0 ||
                parseFloat(withdrawAmount) > currentBalance) &&
                styles.buttonDisabled,
            ]}
            onPress={handleWithdraw}
            disabled={
              isWithdrawPending ||
              !withdrawAmount ||
              parseFloat(withdrawAmount) <= 0 ||
              parseFloat(withdrawAmount) > currentBalance
            }
          >
            <Text style={styles.buttonText}>
              {isWithdrawPending ? "Processing..." : "Withdraw"}
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
  withdrawButton: {
    backgroundColor: "#ff3b30",
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
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 30,
  },
});
