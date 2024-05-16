export default async (artist, album) => {
  artist = artist.replace(/\s/g, '+').replace(/\&/g, '+')
  album = album.replace(/\s/g, '+').replace(/\&/g, '+')

  const response = await (
    await fetch(`https://itunes.apple.com/search?term=${artist}+${album}&limit=1&entity=song`)
  ).json()
  console.log({ response })

  if (response.resultCount === 0 || response.resultCount === '0') {
    // throw new Error('iTunes Store returned with 0 results')
    return {}
  }
  return {
    thumb: response.results[0].artworkUrl100,
    small: response.results[0].artworkUrl100.replace(/100x100/, '600x600'),
    medium: response.results[0].artworkUrl100.replace(/100x100/, '900x900'),
    large: response.results[0].artworkUrl100.replace(/100x100/, '2000x2000')
  }
}
