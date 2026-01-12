import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transfer } from "../../api/transactions";
import { getAllUsers, getMe } from "../../api/auth";

interface User {
  id?: string;
  username: string;
  balance?: number;
  imagePath?: string;
}

export default function Transactions() {
  const [amount, setAmount] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const { data: currentUser, isLoading: isLoadingCurrentUser } = useQuery({
    queryKey: ["user", "me"],
    queryFn: getMe,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", "all"],
    queryFn: getAllUsers,
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["transfer"],
    mutationFn: () => {
      if (!selectedUser?.id) {
        throw new Error("Please select a recipient");
      }
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }
      return transfer(numAmount, selectedUser.id);
    },
    onSuccess: (data) => {
      console.log("Transfer successful:", data);
      // Refetch user data to update balances
      queryClient.refetchQueries({ queryKey: ["user", "me"] });
      queryClient.refetchQueries({ queryKey: ["users", "all"] });
      // Show success message
      Alert.alert(
        "Success",
        `Successfully transferred $${parseFloat(amount).toFixed(2)} to ${
          selectedUser?.username
        }`
      );
      // Clear the form
      setAmount("");
      setSelectedUser(null);
    },
    onError: (error: any) => {
      console.log("Transfer error:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to transfer. Please try again.";
      Alert.alert("Transfer Failed", errorMsg);
    },
  });

  const handleTransfer = () => {
    const numAmount = parseFloat(amount);
    const currentBalance = currentUser?.data?.balance || 0;

    // Validation
    if (!selectedUser) {
      Alert.alert("No Recipient", "Please select a recipient");
      return;
    }

    if (amount.trim() === "" || isNaN(numAmount)) {
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
        )}. Cannot transfer $${numAmount.toFixed(2)}.`
      );
      return;
    }

    // Call the mutation
    mutate();
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }
    const baseURL = "https://bank-app-be-eapi-btf5b.ondigitalocean.app";
    return `${baseURL}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  };

  const users = (data?.data || data || []) as User[];
  const currentUsername = currentUser?.data?.username;
  const currentBalance = currentUser?.data?.balance || 0;

  // Filter out current user from the list
  const otherUsers = users.filter(
    (user) => user.username !== currentUsername && user.id
  );

  const renderUserItem = ({ item }: { item: User }) => {
    const isSelected = selectedUser?.id === item.id;
    const imageUrl = getImageUrl(item.imagePath);

    return (
      <TouchableOpacity
        style={[styles.userCard, isSelected && styles.selectedUserCard]}
        onPress={() => setSelectedUser(item)}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImageText}>
              {item.username?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        )}
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          {item.balance !== undefined && (
            <Text style={styles.balance}>
              Balance: ${item.balance.toFixed(2)}
            </Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading || isLoadingCurrentUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error loading users</Text>
        <Text style={styles.errorSubtext}>
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Send Money</Text>
        <Text style={styles.subtitle}>Transfer money to another user</Text>

        {/* Current Balance Display */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Your Balance</Text>
          <Text style={styles.balanceAmount}>${currentBalance.toFixed(2)}</Text>
        </View>

        {/* Select Recipient Section */}
        <Text style={styles.sectionTitle}>Select Recipient</Text>
        {otherUsers.length === 0 ? (
          <Text style={styles.emptyText}>No other users available</Text>
        ) : (
          <FlatList
            data={otherUsers}
            keyExtractor={(item) => item.id || item.username}
            renderItem={renderUserItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.usersList}
          />
        )}

        {selectedUser && (
          <View style={styles.selectedRecipient}>
            <Text style={styles.selectedRecipientLabel}>Sending to:</Text>
            <Text style={styles.selectedRecipientName}>
              {selectedUser.username}
            </Text>
          </View>
        )}

        {/* Amount Input Section */}
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
            onSubmitEditing={handleTransfer}
          />
          <TouchableOpacity
            style={[
              styles.button,
              (isPending ||
                !amount ||
                !selectedUser ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > currentBalance) &&
                styles.buttonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={
              isPending ||
              !amount ||
              !selectedUser ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > currentBalance
            }
          >
            <Text style={styles.buttonText}>
              {isPending ? "Processing..." : "Send Money"}
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
    marginBottom: 20,
  },
  balanceCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00A86B",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  usersList: {
    paddingBottom: 10,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    minWidth: 200,
  },
  selectedUserCard: {
    borderColor: "#007AFF",
    backgroundColor: "#e3f2fd",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  profileImageText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  balance: {
    fontSize: 12,
    color: "#666",
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  checkmarkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedRecipient: {
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  selectedRecipientLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  selectedRecipientName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
  },
  inputContainer: {
    marginTop: 20,
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ff3b30",
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    marginTop: 20,
    fontSize: 16,
  },
});
