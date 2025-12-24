import { getColors } from 'react-native-image-colors';
import { storage } from '../store/musicStore';

const COLOR_CACHE_PREFIX = 'image_colors_';

/**
 * Get cached colors for an image URI, or fetch and cache if not available
 * @param imageUri - The image URI to get colors for
 * @returns Promise with the color object
 */
export const getImageColors = async (imageUri: string): Promise<any> => {
  const cacheKey = `${COLOR_CACHE_PREFIX}${imageUri}`;
  
  // Check MMKV cache first
  try {
    const cachedColors = storage.getString(cacheKey);
    if (cachedColors) {
      console.log('found in cache', cacheKey);
      
      return JSON.parse(cachedColors);
    }
  } catch (error) {
    console.error('Error reading color cache:', error);
  }
  
  // If not cached, fetch colors
  try {
    const colors = await getColors(imageUri, {
      fallback: '#000000',
      cache: true,
      key: imageUri,
    });
    
    // Cache in MMKV
    try {
      storage.set(cacheKey, JSON.stringify(colors));
      console.log('new cachekey for colors', cacheKey);
      
    } catch (error) {
      console.error('Error caching colors:', error);
    }
    
    return colors;
  } catch (error) {
    console.error('Error fetching colors:', error);
    return { primary: '#000000', average: '#000000' };
  }
};


