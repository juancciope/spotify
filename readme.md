# Spotify Playlist Email Scraper

## What does Spotify Playlist Email Scraper do?

This Actor searches Spotify playlists and extracts email addresses from their descriptions. It's designed specifically for musicians, record labels, and music promoters looking to find playlist curators who accept music submissions. The Actor automatically identifies playlists with contact information in their descriptions, making it easy to discover submission opportunities on [Spotify](https://open.spotify.com).

## Why use Spotify Playlist Email Scraper?

### Benefits for Musicians and Labels

- **Find submission opportunities**: Discover playlist curators actively accepting new music
- **Save time**: Automatically extract contact information instead of manually checking playlists
- **Target your genre**: Search for specific music styles to find relevant curators
- **Build your network**: Create a database of playlist contacts for your promotion campaigns

### Business Use Cases

1. **Independent Artists**: Find playlists accepting submissions in your genre
2. **Record Labels**: Build relationships with playlist curators for artist promotion
3. **Music Promoters**: Create targeted outreach campaigns for new releases
4. **Music Marketers**: Research playlist submission opportunities for clients

## How to scrape Spotify playlists for emails

1. Enter a search term (e.g., "indie submit", "hip hop submission", "playlist submission")
2. Set the maximum number of playlists to check
3. Click "Start" to begin scraping
4. Download results with playlist names, descriptions, and extracted emails

The Actor will search Spotify for playlists matching your query and extract any email addresses found in the playlist descriptions.

## Is it legal to scrape Spotify?

Our scraper extracts only publicly available information from playlist descriptions that curators have chosen to share. We do not access private user data, login credentials, or any protected content. The Actor simply automates the process of viewing public playlist information that any Spotify user can access.

However, you should:
- Respect curator preferences and submission guidelines
- Use extracted emails responsibly and professionally
- Comply with anti-spam laws when contacting curators
- Follow Spotify's Terms of Service regarding automated access

## Input

The Spotify Playlist Email Scraper has the following input options:

- **Search Query** (required): Keywords to search for playlists (e.g., "submit music", "indie playlist")
- **Maximum Playlists**: Number of playlists to check (default: 50, max: 500)
- **Proxy Configuration**: Proxy settings to avoid rate limiting
- **Debug Mode**: Option to save all playlist data for analysis

## Output

You can download the scraped data in various formats (JSON, CSV, Excel). Here's an example of the data structure:

```json
{
  "url": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  "playlistId": "37i9dQZF1DXcBWIGoYBM5M",
  "title": "Indie Music Submissions",
  "description": "Submit your indie tracks to submissions@indieplaylist.com. We feature emerging artists every week!",
  "owner": "Indie Curator",
  "emails": ["submissions@indieplaylist.com"],
  "hasEmail": true,
  "followerCount": 25000,
  "trackCount": 50,
  "imageUrl": "https://example.com/playlist-cover.jpg",
  "scrapedAt": "2024-01-15T10:30:00Z"
}
```

## Tips and Advanced Options

### Optimize Your Search

- Use specific keywords like "submit", "submission", "demo", "promo"
- Combine genre with submission terms: "rock submission", "electronic submit"
- Try different languages if targeting international curators

### Best Practices

1. **Start small**: Test with 10-20 playlists first to refine your search terms
2. **Use proxies**: Enable proxy configuration to avoid rate limiting
3. **Regular searches**: Run the Actor weekly to find new submission opportunities
4. **Track results**: Keep a spreadsheet of successful playlist submissions

### Performance Tips

- The Actor processes approximately 20-30 playlists per minute
- Larger searches (200+ playlists) may take 10-15 minutes
- Use specific search terms to find more relevant results faster

## Webhook Integration

You can set up webhooks to get notified when the scraping is complete:

1. Go to the Actor's Settings
2. Add a webhook URL
3. Select "Run succeeded" event
4. Process results automatically in your system

## Support

If you encounter any issues or have questions:

1. Check the Actor log for specific error messages
2. Ensure your search query returns results on Spotify
3. Try reducing the number of playlists if experiencing timeouts
4. Contact support through the Issues tab

## Changelog

### Version 1.0.0
- Initial release
- Search playlist functionality
- Email extraction from descriptions
- Proxy support for reliable scraping