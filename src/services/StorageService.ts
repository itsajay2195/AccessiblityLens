import {MMKV} from 'react-native-mmkv';

const storage = new MMKV();
const STORAGE_KEY = 'accessibility_analyses';

export const saveAnalysis = (analysis: any) => {
  try {
    const existingData = storage.getString(STORAGE_KEY);
    const analyses = existingData ? JSON.parse(existingData) : [];

    const analysisWithId = {
      ...analysis,
      id: Date.now().toString(),
    };

    analyses.unshift(analysisWithId);

    // Keep only last 50 analyses
    const limitedAnalyses = analyses.slice(0, 50);

    storage.set(STORAGE_KEY, JSON.stringify(limitedAnalyses));
    return analysisWithId;
  } catch (error) {
    console.error('Save analysis error:', error);
    throw error;
  }
};

export const getAnalyses = () => {
  try {
    const data = storage.getString(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Get analyses error:', error);
    return [];
  }
};

export const deleteAnalysis = (id: string) => {
  try {
    const existingData = storage.getString(STORAGE_KEY);
    const analyses = existingData ? JSON.parse(existingData) : [];

    const filteredAnalyses = analyses.filter((a: any) => a.id !== id);

    storage.set(STORAGE_KEY, JSON.stringify(filteredAnalyses));
    return true;
  } catch (error) {
    console.error('Delete analysis error:', error);
    return false;
  }
};
