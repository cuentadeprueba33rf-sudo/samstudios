export interface Movie {
  id: string;
  title: string;
  description: string;
  year: string;
  genre: string[];
  posterUrl: string;
  streamUrl: string; // The external link (iframe or video file)
  rating: number;
  director?: string;
  actors?: string[];
  imdbId?: string; // Optional IMDB ID for auto-embed
  trendingRank?: number; // 1-10 for Trending row
}

export interface Actor {
  id: string;
  name: string;
  character: string;
  movie: string;
  image: string;
  award?: string;
}

export interface AIGeneratedMetadata {
  description: string;
  year: string;
  genre: string[];
  rating: number;
  suggestedTagline: string;
  imdbId?: string;
}

export enum ViewState {
  HOME = 'HOME',
  PLAYER = 'PLAYER',
  ADD_MOVIE = 'ADD_MOVIE',
  EDIT_MOVIE = 'EDIT_MOVIE',
  MY_LIST = 'MY_LIST',
  LOGIN = 'LOGIN',
  REQUEST = 'REQUEST'
}