import { create as makeYoutubeDl } from "youtube-dl-exec";
import https from "https";
import { PassThrough } from "stream";

const youtubedl = makeYoutubeDl("bin/youtube-dl.exe");

export async function getDownloadUrl(
    videoId: string
): Promise<string | undefined> {
    console.log(`Retrieving download URL for ${videoId}`);

    // Retrieve download information using Youtube-DL
    const details = await youtubedl(
        `https://www.youtube.com/watch?v=${videoId}`,
        {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificate: true,
            preferFreeFormats: true,
            youtubeSkipDashManifest: true,
        }
    );

    // Find the first result that is audio-only and OPUS codec
    return details.formats.find(
        (x) => x.vcodec === "none" && x.acodec === "opus"
    )?.url;
}

export async function getAudioStream(url: string): Promise<PassThrough> {
    console.log(`Creating audio stream from ${url.split("?")[0]}`);

    // Create a duplex stream
    const tunnel = new PassThrough();

    // Begin downloading the audio, piping it through the duplex tunnel in real-time
    https.get(url, (res) => {
        res.on("data", (data) => tunnel.write(data));
        res.on("end", () => tunnel.end());
    });

    return tunnel;
}
