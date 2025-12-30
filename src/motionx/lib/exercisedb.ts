import axios, { AxiosInstance } from 'axios';
import { mmkv } from './mmkv';

let client: AxiosInstance | null = null;

export const exerciseDbApiKey = 'b65e121ebfmsh20c0fac4910f5dcp1d1de7jsn524616479caa';
export const exerciseDbApiHost = 'exercisedb-api1.p.rapidapi.com';

function getClient() {
  const key = mmkv.getString('exercisedb_api_key') || exerciseDbApiKey;
  if (!client) {
    client = axios.create({
      baseURL: 'https://exercisedb-api1.p.rapidapi.com/api/v1',
      headers: {
        'x-rapidapi-host': 'exercisedb-api1.p.rapidapi.com',
        'x-rapidapi-key': key,
      },
    });
  } else {
    client.defaults.headers['x-rapidapi-key'] = key;
  }
  return client!;
}

export function setExerciseDbApiKey(key: string) {
  console.log('exercisedb_api_key', key);
  
  mmkv.set('exercisedb_api_key', key);
  if (client) client.defaults.headers['x-rapidapi-key'] = key;
}

export function getStoredExerciseDbApiKey() {
  return mmkv.getString('exercisedb_api_key');
}

export interface NamedImageItem {
  name: string;
  imageUrl: string;
}

export interface ExerciseListItem {
  exerciseId: string;
  name: string;
  equipments?: string[];
  bodyParts?: string[];
  exerciseType?: string;
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  imageUrl?: string;
  keywords?: string[];
}

export interface ExerciseDetail {
  exerciseId: string;
  name: string;
  equipments: string[];
  bodyParts: string[];
  exerciseType: string;
  targetMuscles: string[];
  secondaryMuscles: string[];
  keywords: string[];
  overview?: string;
  instructions?: string[];
  exerciseTips?: string[];
  variations?: string[];
  relatedExerciseIds?: string[];
  videoUrl?: string;
  imageUrl?: string;
}

export interface ListMeta {
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  previousCursor?: string;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
}

export interface ApiExercisesResponse {
  success: boolean;
  meta: ListMeta;
  data: ExerciseListItem[];
}

export interface ApiDetailResponse<T> {
  success: boolean;
  data: T;
}

export type GetExercisesParams = {
  name?: string;
  keywords?: string[];
  targetMuscles?: string[];
  secondaryMuscles?: string[];
  exerciseType?: string;
  bodyParts?: string[];
  equipments?: string[];
  limit?: number;
  after?: string;
  before?: string;
};

export async function getBodyParts() {
  const api = getClient();
  const res = await api.get<ApiListResponse<NamedImageItem>>('/bodyparts');
  return res.data.data;
}

export async function getEquipments() {
  const api = getClient();
  const res = await api.get<ApiListResponse<NamedImageItem>>('/equipments');
  return res.data.data;
}

export async function getExerciseTypes() {
  const api = getClient();
  const res = await api.get<ApiListResponse<NamedImageItem>>('/exercisetypes');
  return res.data.data;
}

export async function searchExercises(search: string) {
  const api = getClient();
  const res = await api.get<ApiListResponse<{ exerciseId: string; name: string; imageUrl: string }>>(
    '/exercises/search',
    { params: { search } },
  );
  return res.data.data;
}

export async function getExercises(params: GetExercisesParams) {
  const api = getClient();
  const qp: Record<string, string | number | undefined> = {};
  if (params.name) qp.name = params.name;
  if (params.keywords && params.keywords.length) qp.keywords = params.keywords.join(',');
  if (params.targetMuscles && params.targetMuscles.length) qp.targetMuscles = params.targetMuscles.join(',');
  if (params.secondaryMuscles && params.secondaryMuscles.length) qp.secondaryMuscles = params.secondaryMuscles.join(',');
  if (params.exerciseType) qp.exerciseType = params.exerciseType;
  if (params.bodyParts && params.bodyParts.length) qp.bodyParts = params.bodyParts.join(',');
  if (params.equipments && params.equipments.length) qp.equipments = params.equipments.join(',');
  if (typeof params.limit === 'number') qp.limit = params.limit;
  if (params.after) qp.after = params.after;
  if (params.before) qp.before = params.before;

  const res = await api.get<ApiExercisesResponse>('/exercises', { params: qp });
  return res.data;
}

export async function getExerciseById(exerciseId: string) {
  const api = getClient();
  const res = await api.get<ApiDetailResponse<ExerciseDetail>>(`/exercises/${exerciseId}`);
  return res.data.data;
}

