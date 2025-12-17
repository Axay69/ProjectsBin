import axios from 'axios';

const api = axios.create({ baseURL: 'https://v2.exercisedb.dev/api/v1' });

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
  const res = await api.get<ApiListResponse<NamedImageItem>>('/bodyparts');
  return res.data.data;
}

export async function getEquipments() {
  const res = await api.get<ApiListResponse<NamedImageItem>>('/equipments');
  return res.data.data;
}

export async function getExerciseTypes() {
  const res = await api.get<ApiListResponse<NamedImageItem>>('/exercisetypes');
  return res.data.data;
}

export async function searchExercises(search: string) {
  const res = await api.get<ApiListResponse<{ exerciseId: string; name: string; imageUrl: string }>>(
    '/exercises/search',
    { params: { search } },
  );
  return res.data.data;
}

export async function getExercises(params: GetExercisesParams) {
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
  const res = await api.get<ApiDetailResponse<ExerciseDetail>>(`/exercises/${exerciseId}`);
  return res.data.data;
}

