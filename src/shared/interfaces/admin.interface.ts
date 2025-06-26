export interface ContentDto{
    mangaId: string;
    episodeId: string;
}

export interface EpisodeDto {
    chapter: string;
    title?: string;
    mangaId: string;
}

export interface MangaDto {
    title: string;
    author: string;
    description: string;
}

export interface ParamsManga { 
    title?: string;
    author?: string;
}