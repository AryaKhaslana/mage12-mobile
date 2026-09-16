import AsyncStorage from '@react-native-async-storage/async-storage';

const HOME_TUTORIAL_KEY = 'hasSeenHomeTutorial';

export const checkTutorialFinished = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(HOME_TUTORIAL_KEY);
    return value === 'true';
  } catch (e) {
    console.error('Error checking tutorial status', e);
    return false; // Default to false if error
  }
};

export const markTutorialFinished = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(HOME_TUTORIAL_KEY, 'true');
  } catch (e) {
    console.error('Error saving tutorial status', e);
  }
};

export const resetTutorial = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(HOME_TUTORIAL_KEY);
  } catch (e) {
    console.error('Error resetting tutorial status', e);
  }
};

