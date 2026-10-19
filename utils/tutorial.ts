import AsyncStorage from '@react-native-async-storage/async-storage';

export const TUTORIAL_STORAGE_KEYS = [
  'hasSeenHomeTutorial',
  'hasSeenCoachMark',
  'coachmark_completed',
];

export const checkTutorialFinished = async (): Promise<boolean> => {
  try {
    const pairs = await AsyncStorage.multiGet(TUTORIAL_STORAGE_KEYS);
    return pairs.some(([_, value]) => value === 'true');
  } catch (e) {
    console.error('Error checking tutorial status', e);
    return false;
  }
};

export const markTutorialFinished = async (): Promise<void> => {
  try {
    const pairs: [string, string][] = TUTORIAL_STORAGE_KEYS.map((key) => [key, 'true']);
    await AsyncStorage.multiSet(pairs);
  } catch (e) {
    console.error('Error saving tutorial status', e);
  }
};

export const resetTutorial = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove(TUTORIAL_STORAGE_KEYS);
  } catch (e) {
    console.error('Error resetting tutorial status', e);
  }
};
