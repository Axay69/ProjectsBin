import RNFS from 'react-native-fs';

const getFileNameFromUrl = (url: string) =>
  encodeURIComponent(url).replace(/%/g, '');

// Simple cache helper for media URLs
export const getCachedUrl = async (url: string): Promise<string> => {
  try {
    // Only cache remote HTTP/HTTPS URLs
    if (!url.startsWith('http')) {
      return url;
    }

    const cacheDir = `${RNFS.CachesDirectoryPath}/xtunes-media-cache`;
    // Use an encoded version of the URL as filename to avoid illegal chars
    const fileName = getFileNameFromUrl(url);
    const cachePath = `${cacheDir}/${fileName}`;

    const exists = await RNFS.exists(cachePath);
    if (exists) {
      return cachePath;
    }

    // Ensure cache directory exists
    const dirExists = await RNFS.exists(cacheDir);
    if (!dirExists) {
      await RNFS.mkdir(cacheDir);
    }

    // Download and cache the file
    await RNFS.downloadFile({
      fromUrl: url,
      toFile: cachePath,
    }).promise;

    return cachePath;
  } catch (e) {
    console.log('getCachedUrl error, falling back to original URL:', e);
    return url;
  }
};

