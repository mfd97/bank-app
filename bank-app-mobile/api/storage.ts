import * as SecureStore from 'expo-secure-store';

const setToken = async (token: string) => {
    await SecureStore.setItemAsync("token", token )
};

const getToken = async () => {
    await SecureStore.getItemAsync("token")
};

const deleteToken = async () => {
    await SecureStore.deleteItemAsync("token")
};