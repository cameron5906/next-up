import { YoutubeResult } from "./YoutubeResult";

export interface YoutubeSearchResponse {
    kind: string;
    etag: string;
    nextPageToken: string;
    regionCode: string;
    pageInfo: {
        totalResults: number;
        resultsPerPage: number;
    };
    items: YoutubeResult[];
}
