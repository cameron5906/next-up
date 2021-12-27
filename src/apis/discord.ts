import { joinVoiceChannel, VoiceConnection } from "@discordjs/voice";
import { Client, Intents, TextChannel, User, VoiceChannel } from "discord.js";
import { onMessage } from "..";
import { audioPlayer } from "../audio-manager";

export let activeVoiceChannel: VoiceChannel | null = null;
export let voiceConnection: VoiceConnection | null = null;

export const discordClient = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
    ],
});

discordClient.on("ready", ({ user }) => {
    console.log(`Logged in as ${user.tag}`);

    discordClient.on("message", (msg) => {
        // Do not process messages from ourselves
        if (msg.author.id === discordClient?.user?.id) return;

        console.log(`Processing message: ${msg.content}`);

        try {
            onMessage(msg, discordClient?.user?.id || "");
        } catch (ex) {
            console.error(ex);
        }
    });
});

export function setVoiceChannel(voiceChannel: VoiceChannel) {
    // First check if we are already on a voice channel
    if (voiceConnection !== null) {
        console.log(
            `Disconnecting from voice channel ${activeVoiceChannel?.name}`
        );
        voiceConnection.disconnect();
    }

    console.log(`Setting voice channel to ${voiceChannel.name}`);

    // Set the active channel and create a connection, and then attach audio player
    activeVoiceChannel = voiceChannel;
    voiceConnection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
    });

    voiceConnection?.subscribe(audioPlayer);
}

export function leaveVoiceChannel() {
    console.log(`Leaving active voice channel`);

    // Short circuit if we aren't in one
    if (voiceConnection === null) return;

    // Disconnect and clean up
    activeVoiceChannel = null;
    voiceConnection.disconnect();
    voiceConnection = null;
}

export async function getActiveVoiceChannel(
    channel: TextChannel,
    user: User
): Promise<VoiceChannel | null> {
    const channels = await channel.guild?.channels.fetch();

    const activeChannel = channels?.find(
        (x) =>
            x.type === "GUILD_VOICE" && x.members.some((m) => m.id === user.id)
    );

    if (
        !activeChannel ||
        !activeChannel.id ||
        !activeChannel?.guildId ||
        !activeChannel?.guild?.voiceAdapterCreator
    )
        return null;

    return activeChannel as VoiceChannel;
}

export async function setDiscordStatus(text: string) {
    console.log(`Setting discord presence`);

    discordClient.user?.setPresence({
        activities: [{ name: text, type: "PLAYING" }],
        afk: text === "",
        status: "online",
    });
}
