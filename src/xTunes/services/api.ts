import axios from 'axios';
import { Song, Playlist } from '../types';

const BASE_URL = 'https://xtone-api.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
});

export const searchSongs = async (query: string): Promise<Song[]> => {
  try {
    const response = await api.get(`/result/?query=${encodeURIComponent(query)}&lyrics=true`);
    return response.data;
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

export const getPlaylist = async (url: string): Promise<any> => {
  try {
    const response = await api.get(`/playlist/?query=${encodeURIComponent(url)}&lyrics=false`);
    return response.data;
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
};

export const getAlbum = async (url: string): Promise<any> => {
  try {
    const response = await api.get(`/album/?query=${encodeURIComponent(url)}&lyrics=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching album:', error);
    return null;
  }
};

export const getSongDetails = async (url: string): Promise<Song | null> => {
  try {
    const response = await api.get(`/song/?query=${encodeURIComponent(url)}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching song details:', error);
    return null;
  }
};

export const getLyrics = async (urlOrId: string): Promise<any> => {
  try {
    const response = await api.get(`/lyrics/?query=${encodeURIComponent(urlOrId)}&lyrics=true`);
    return response.data;
  } catch (error) {
    console.error('Error fetching lyrics:', error);
    return null;
  }
};

// Mock/Default Data
export const DEFAULT_PLAYLISTS = [
  'https://www.jiosaavn.com/featured/hindi-hit-songs/ZodsPn39CSjwxP8tCU-flw__',
  'https://www.jiosaavn.com/featured/best-of-2010s/gn19HTwL-lfgEhiRleA1SQ__',
  'https://www.jiosaavn.com/featured/indipop-sad-songs/QTZoJQAOnmZFo9wdEAzFBA__',
];

export const TRENDING_PLAYLISTS = [
  'https://www.jiosaavn.com/featured/lets-play-arijit-singh-hindi/Iz0pi7nkjUE_',
];
