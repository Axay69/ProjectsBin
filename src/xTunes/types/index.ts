export interface Song {
  id: string;
  song: string;
  album: string;
  album_url: string;
  artistMap: Record<string, string>;
  duration: string;
  encrypted_media_url: string;
  image: string;
  language: string;
  media_url: string;
  primary_artists: string;
  singers: string;
  year: string;
  has_lyrics: string;
  perma_url: string;
  // Cached colors from image
  imageColors?: any;
  // Cached media URL
  cached_media_url?: string;
}

export interface Playlist {
  listid: string;
  listname: string;
  image: string;
  perma_url: string;
  firstname?: string;
  subtitle_desc?: string[];
  type?: string;
  songs?: Song[];
  // Legacy/Computed
  id?: string;
  title?: string;
  subtitle?: string;
}

export interface SearchResult {
  songs: Song[];
  playlists: Playlist[];
  albums: Playlist[];
}
