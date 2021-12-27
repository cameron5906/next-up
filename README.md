# @NextUp

A self hosted replacement for Discord music streaming using YoutubeDL and support for Spotify track and playlist URLs.



## Setup

1. Clone the repository

2. Create a `bin` folder in the root directory

3. Add `youtube-dl.exe` to the `bin` folder

4. Create a `.env` file in the root directory with the following content:

   ```
   YOUTUBE_KEY={Your Youtube API Key}
   SPOTIFY_CLIENT_ID={Your Spotify Client ID}
   SPOTIFY_CLIENT_SECRET={Your Spotify Client Secret}
   DISCORD_BOT_TOKEN={Your Discord Bot Token}
   ```

5. Run `npm install`

6. Start with `npm start`