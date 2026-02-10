import { atom } from 'jotai';

export interface UserProfile {
    name: string;
    email: string;
    bio: string;
    themeColor: string;
}

export const profileAtom = atom<UserProfile>({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'React Native Enthusiast & Jotai Learner',
    themeColor: '#3b82f6',
});

// A derived atom for character count of bio
export const bioCharacterCountAtom = atom((get) => get(profileAtom).bio.length);
