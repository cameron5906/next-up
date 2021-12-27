import dotenv from "dotenv";
// Setup env vars
dotenv.config();

import { Message, TextChannel } from "discord.js";
import { discordClient } from "./apis/discord";
import { setupSpotify } from "./apis/spotify";
import { store } from "./store";
import { processMessage } from "./store/actions";

const { DISCORD_BOT_TOKEN } = process.env;

export async function onMessage(message: Message, localId: string) {
    // Clean the @NextUp tag out of the message
    const query = message.content.split(`<@!${localId}>`)[1].trim();

    await store.dispatch(
        processMessage(query, message.author, message.channel as TextChannel)
    );
}

process.on("uncaughtException", (e) => console.log(e));

discordClient.login(DISCORD_BOT_TOKEN);
setupSpotify();
