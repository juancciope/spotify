import { Actor } from 'apify';
import { PlaywrightCrawler, log } from 'crawlee';
import { chromium } from 'playwright';

// Initialize the Apify SDK
await Actor.init();

// Get input from the Actor
const input = await Actor.getInput() ?? {};
const {
    searchQuery = '',
    maxPlaylists = 50,
    proxyConfiguration = { useApifyProxy: true },
    includePrivatePlaylists = false,
    emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    debugMode = false
} = input;

log.info('Starting Spotify Playlist Email Scraper', { searchQuery, maxPlaylists });

// Validate input
if (!searchQuery) {
    throw new Error('Search query is required. Please provide a search term for playlists.');
}

// Configure the crawler
const crawler = new PlaywrightCrawler({
    proxyConfiguration: Actor.createProxyConfiguration(proxyConfiguration),
    launchContext: {
        launchOptions: {
            headless: true,
        },
    },
    browserPoolOptions: {
        useFingerprints: true,
        fingerprintOptions: {
            fingerprintGeneratorOptions: {
                browsers: ['chrome'],
                devices: ['desktop'],
                operatingSystems: ['windows', 'macos'],
            },
        },
    },
    maxRequestRetries: 3,
    requestHandlerTimeoutSecs: 120,
    maxRequestsPerCrawl: maxPlaylists * 2, // Account for pagination and playlist pages
    
    async requestHandler({ request, page, enqueueLinks }) {
        const { label } = request.userData;
        
        if (label === 'SEARCH') {
            log.info('Processing search results page', { url: request.url });
            
            // Wait for search results to load
            await page.waitForSelector('[data-testid="search-results"]', { timeout: 30000 });
            
            // Extract playlist links
            const playlistLinks = await page.$$eval(
                'a[href*="/playlist/"]',
                (links) => links.map(link => ({
                    url: link.href,
                    title: link.querySelector('[data-testid="entity-title-line"]')?.textContent || '',
                }))
            );
            
            log.info(`Found ${playlistLinks.length} playlists on this page`);
            
            // Enqueue playlist pages
            for (const playlist of playlistLinks.slice(0, maxPlaylists)) {
                await crawler.addRequests([{
                    url: playlist.url,
                    userData: { label: 'PLAYLIST', title: playlist.title },
                }]);
            }
            
            // Check for next page
            const hasNextPage = await page.$('button[aria-label="Next"]');
            if (hasNextPage && playlistLinks.length < maxPlaylists) {
                await page.click('button[aria-label="Next"]');
                await page.waitForTimeout(2000);
                const nextUrl = page.url();
                await crawler.addRequests([{
                    url: nextUrl,
                    userData: { label: 'SEARCH' },
                }]);
            }
        }
        
        if (label === 'PLAYLIST') {
            log.info('Processing playlist page', { url: request.url, title: request.userData.title });
            
            try {
                // Wait for playlist to load
                await page.waitForSelector('[data-testid="playlist-page"]', { timeout: 30000 });
                
                // Extract playlist data
                const playlistData = await page.evaluate(() => {
                    const getTextContent = (selector) => {
                        const element = document.querySelector(selector);
                        return element ? element.textContent.trim() : '';
                    };
                    
                    const getMetaContent = (property) => {
                        const meta = document.querySelector(`meta[property="${property}"]`);
                        return meta ? meta.getAttribute('content') : '';
                    };
                    
                    return {
                        title: getTextContent('[data-testid="entity-title"]') || getMetaContent('og:title'),
                        description: getMetaContent('og:description') || getTextContent('[data-testid="entity-description"]'),
                        owner: getTextContent('[data-testid="entity-subtitle"] a'),
                        imageUrl: getMetaContent('og:image'),
                        followersText: getTextContent('[data-testid="entity-subtitle"]'),
                        trackCount: document.querySelectorAll('[data-testid="track-row"]').length,
                    };
                });
                
                // Extract emails from description
                const emails = playlistData.description ? 
                    [...new Set(playlistData.description.match(emailRegex) || [])] : [];
                
                if (emails.length > 0 || debugMode) {
                    const result = {
                        url: request.url,
                        playlistId: request.url.split('/playlist/')[1]?.split('?')[0],
                        ...playlistData,
                        emails: emails,
                        hasEmail: emails.length > 0,
                        scrapedAt: new Date().toISOString(),
                    };
                    
                    // Extract follower count from text
                    const followerMatch = playlistData.followersText?.match(/(\d+(?:,\d+)*)\s*likes?/i);
                    if (followerMatch) {
                        result.followerCount = parseInt(followerMatch[1].replace(/,/g, ''), 10);
                    }
                    
                    await Actor.pushData(result);
                    log.info(`Found playlist with ${emails.length} email(s)`, { 
                        title: playlistData.title, 
                        emails 
                    });
                }
            } catch (error) {
                log.error('Error processing playlist', { 
                    url: request.url, 
                    error: error.message 
                });
            }
        }
    },
    
    async failedRequestHandler({ request }, error) {
        log.error(`Request ${request.url} failed too many times`, {
            error: error.message,
            userData: request.userData,
        });
    },
});

// Construct search URL
const searchUrl = `https://open.spotify.com/search/${encodeURIComponent(searchQuery)}/playlists`;

// Add the initial search request
await crawler.addRequests([{
    url: searchUrl,
    userData: { label: 'SEARCH' },
}]);

// Run the crawler
await crawler.run();

// Get the dataset
const dataset = await Actor.openDataset();
const { items } = await dataset.getData();

log.info('Scraping completed', {
    totalPlaylists: items.length,
    playlistsWithEmails: items.filter(item => item.hasEmail).length,
});

// Clean up
await Actor.exit();