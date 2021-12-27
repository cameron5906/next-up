import fetch from "cross-fetch";
import { YoutubeResult, YoutubeSearchResponse } from "../types";

const { YOUTUBE_KEY } = process.env;

export async function getYoutubeResults(
    query: string
): Promise<YoutubeResult[]> {
    console.log(`Searching youtube for: ${query}`);

    const response = await fetch(
        `https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=25&q=${encodeURIComponent(
            query
        )}&key=${YOUTUBE_KEY}`
    );

    const data: YoutubeSearchResponse = await response.json();

    return data.items;
}
