export interface SpotifyAlbumImage {
  url: string
}

export interface SpotifyAlbum {
  images: [SpotifyAlbumImage, SpotifyAlbumImage, SpotifyAlbumImage]
}

export interface SpotifyArtist {
  name: string
}

export interface SpotifyTrack {
  album: SpotifyAlbum
  artists: SpotifyArtist[]
  name: string
}

export interface SpotifyRecentlyPlayedItem {
  track: SpotifyTrack
}

export interface SpotifyRecentlyPlayed {
  items: SpotifyRecentlyPlayedItem[]
}

export interface SpotifyCurrentlyPlaying {
  item: SpotifyTrack | 'None'
  currently_playing_type: 'track' | 'episode'
}
