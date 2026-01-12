import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../../api/auth";
import { setToken } from "../../api/storage";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ["login"],
    mutationFn: () => login(username, password),
    onSuccess: async (data) => {
      console.log("Success:", data);
      setErrorMessage("");
      // Store the token if it exists in the response
      const token = data?.token || data?.data?.token;
      if (token) {
        await setToken(token);
      }
      // Invalidate user query to fetch current user data
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      router.push("/(tabs)/home");
    },
    onError: (err: any) => {
      console.log("Login error:", err);
      // Extract error message from axios error response
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid username or password. Please try again.";
      setErrorMessage(errorMsg);
      Alert.alert("Login Failed", errorMsg);
    },
  });

  const handleSignIn = () => {
    setErrorMessage("");
    mutate();
  };

  const handleUsernameChange = (text: string) => {
    setUsername(text);
    setErrorMessage("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setErrorMessage("");
  };

  const content = (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={handleUsernameChange}
            autoCapitalize="none"
            autoComplete="username"
            textContentType="username"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={handlePasswordChange}
            secureTextEntry={!isPasswordVisible}
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text style={styles.eyeIconText}>
              {isPasswordVisible ? "👁️" : "👁️‍🗨️"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            (!username || !password || isPending) && styles.buttonDisabled,
          ]}
          onPress={handleSignIn}
          disabled={!username || !password || isPending}
        >
          <Text style={styles.buttonText}>
            {isPending ? "Signing In..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text style={styles.linkText}>Don&apos;t have an account? </Text>
          <Link href="./register" asChild>
            <TouchableOpacity>
              <Text style={styles.link}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );

  if (Platform.OS === "web") {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {content}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 32,
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    borderColor: "#ff3b30",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
    position: "relative",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    color: "#1a1a1a",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 38,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  button: {
    height: 50,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
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
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  linkText: {
    fontSize: 14,
    color: "#666",
  },
  link: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
});
