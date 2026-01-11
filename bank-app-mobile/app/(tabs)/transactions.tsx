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
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import { deposit } from "../../api/transactions";

interface Transaction {
  id: string;
  amount: number;
  date: string;
}

const STORAGE_KEY = "@transactions";

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { mutate, isPending } = useMutation({
    mutationKey: ["deposit"],
    mutationFn: () => deposit(Number(amount)),
    onSuccess: () => {
      console.log("successfully created");
    },
  });

  const saveTransactions = async (newTransactions: Transaction[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTransactions));
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  };

  const addTransaction = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || amount.trim() === "") {
      Alert.alert("Invalid Input", "Please enter a valid number");
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: numAmount,
      date: new Date().toLocaleString(),
    };

    const updatedTransactions = [newTransaction, ...transactions];
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    mutate();
    setAmount("");
  };

  const formatAmount = (amount: number) => {
    return amount >= 0
      ? `+$${amount.toFixed(2)}`
      : `-$${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Transactions</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={addTransaction}
          />
          <TouchableOpacity style={styles.button} onPress={addTransaction}>
            <Text style={styles.buttonText}>Deposit</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.historyTitle}>Transaction History</Text>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>No transactions yet</Text>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((item) => (
              <View key={item.id} style={styles.transactionItem}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionAmount}>
                    {formatAmount(item.amount)}
                  </Text>
                  <Text style={styles.transactionDate}>{item.date}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
  },
  transactionsList: {
    marginBottom: 20,
  },
  transactionItem: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  transactionInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
});
