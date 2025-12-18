import axios, { AxiosInstance } from 'axios';
import { mmkv } from './mmkv';
import RNFetchBlob from 'rn-fetch-blob';

let client: AxiosInstance | null = null;

export const muscleWikiApiKey = 'b65e121ebfmsh20c0fac4910f5dcp1d1de7jsn524616479caa';
export const muscleWikiApiKey2 = '53eb414801msh1122e098717335fp15a909jsnc60e07ecbee3';
export const muscleWikiApiHost = 'musclewiki-api.p.rapidapi.com';

function getClient() {
  const key = mmkv.getString('musclewiki_api_key') || muscleWikiApiKey;
  if (!client) {
    client = axios.create({
      baseURL: 'https://musclewiki-api.p.rapidapi.com',
      headers: {
        'x-rapidapi-host': 'musclewiki-api.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
    });
  } else {
    client.defaults.headers['x-rapidapi-key'] = key;
  }
  return client!;
}

export function setMuscleWikiApiKey(key: string) {
  console.log('musclewiki_api_key', key);
  
  mmkv.set('musclewiki_api_key', key);
  if (client) client.defaults.headers['x-rapidapi-key'] = key;
}

export function getStoredMuscleWikiApiKey() {
  return mmkv.getString('musclewiki_api_key');
}

export type MuscleWikiExerciseSummary = {
  id: number;
  name: string;
};

export type MuscleWikiExerciseDetail = {
  id: number;
  name: string;
  primary_muscles: string[];
  category: string;
  force?: string;
  grips?: string[];
  mechanic?: string;
  difficulty?: string;
  steps?: string[];
  videos?: Array<{
    url: string;
    angle?: string;
    gender?: string;
    og_image?: string;
  }>;
  video_count?: number;
  step_count?: number;
};

export type MWCategory = {
  name: string;
  display_name: string;
  count: number;
};

export type MWMuscle = {
  name: string;
  count: number;
};

export type MWFilters = {
  muscles: string[];
  difficulties: string[];
  forces: string[];
  mechanics: string[];
  grips: string[];
  categories: string[];
};

export async function getRandom(params?: { gender?: string; category?: string }) {
  const api = getClient();
  const res = await api.get<MuscleWikiExerciseDetail[]>('/random', {
    params: {
      gender: params?.gender || undefined,
      category: params?.category || undefined,
    },
  });
  return res.data;
}

export async function getExerciseDetail(id: number) {
  const api = getClient();
  const res = await api.get<MuscleWikiExerciseDetail>(`/exercises/${id}`, { params: { detail: true } });
  return res.data;
}

export type GetExercisesParams = {
  difficulty?: string;
  category?: string;
  muscles?: string[];
  offset?: number;
  limit?: number;
  q?: string;
};

export async function getExercises(params: GetExercisesParams) {
  const api = getClient();
  const qp: Record<string, string | number | string[] | undefined> = {
    difficulty: params.difficulty,
    category: params.category,
    muscles: params.muscles,
    offset: params.offset,
    limit: typeof params.limit === 'number' ? params.limit : 50,
  };
  const res = await api.get<{ total: number; limit: number; offset: number; count: number; results: MuscleWikiExerciseSummary[] }>('/exercises', {
    params: qp,
    paramsSerializer: (params) => {
      const parts: string[] = [];
      Object.keys(params).forEach((key) => {
        const val = params[key];
        if (val === undefined || val === null) return;
        if (Array.isArray(val)) {
          val.forEach((v) => parts.push(`${key}=${encodeURIComponent(v)}`));
        } else {
          parts.push(`${key}=${encodeURIComponent(val as string | number)}`);
        }
      });
      return parts.join('&');
    },
  });
  return res.data;
}

export async function getCategories() {
  const api = getClient();
  const res = await api.get<MWCategory[]>('/categories');
  return res.data;
}

export async function getMuscles() {
  const api = getClient();
  const res = await api.get<MWMuscle[]>('/muscles');
  return res.data;
}

export async function getFilters() {
  const api = getClient();
  const res = await api.get<MWFilters>('/filters');
  return res.data;
}

export async function search(q: string, offset: number = 0, limit: number = 50) {
  const api = getClient();
  const res = await api.get<{ results: MuscleWikiExerciseSummary[]; count: number; offset: number; limit: number }>('/search', {
    params: { q, offset, limit },
  });
  return res.data;
}

export async function cacheMuscleWikiVideo(url: string) {
  const key = mmkv.getString('musclewiki_api_key') || muscleWikiApiKey || '';
  const safe = url.replace(/[^a-zA-Z0-9]/g, '_');
  const dir = RNFetchBlob.fs.dirs.CacheDir;
  const path = `${dir}/musclewiki_${safe}`;
  const exists = await RNFetchBlob.fs.exists(path);
  if (exists) return path;
  await RNFetchBlob.config({ path, fileCache: true }).fetch('GET', url, {
    'x-rapidapi-host': 'musclewiki-api.p.rapidapi.com',
    'x-rapidapi-key': key,
  });
  return path;
}
