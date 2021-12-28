const SteamStore = require("steam-store");

const steamStore = new SteamStore({
    country: "US",
    language: "en",
});

export async function findSteamGame(query: string) {
    const results = await steamStore.storeSearch(query);
    return results;
}
