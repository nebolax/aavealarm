import AsyncStorage from '@react-native-async-storage/async-storage';

const storeKey = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(`@${key}`, jsonValue)
        return true;
    } catch (e) {
      throw new Error(`Error storing ${key}`);
    }
}

const loadKey = async (key) => {
    let jsonValue;
    try {
        jsonValue = await AsyncStorage.getItem(`@${key}`)
        jsonValue = (jsonValue != null) ? JSON.parse(jsonValue) : null;
        return jsonValue;
    } catch (e) {
        throw new Error(`Error loading ${key}`);
    }
}

const useAsyncStorage = () => {
    return { storeKey, loadKey }
}

export default useAsyncStorage;
