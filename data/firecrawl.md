curl -X POST "https://api.firecrawl.dev/v2/search" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"query": "firecrawl web scraping", "limit": 5}'

curl -X POST "https://api.firecrawl.dev/v2/scrape" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"url": "https://firecrawl.dev", "formats": ["markdown"]}'

curl -X POST "https://api.firecrawl.dev/v2/search" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"query": "latest stock price by ticker", "sources": ["alexandria"]}'

curl -X POST "https://api.firecrawl.dev/v2/agent" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"prompt": "Find the founders of Firecrawl"}'

SCRAPE_ID=$(curl -s -X POST "https://api.firecrawl.dev/v2/scrape" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"url": "https://firecrawl.dev"}' | jq -r '.data.metadata.scrapeId')

curl -X POST "https://api.firecrawl.dev/v2/scrape/$SCRAPE_ID/interact" \
-H "Authorization: Bearer fc-87076fc5d2c84077bb578469683a2e53" \
-H "Content-Type: application/json" \
-d '{"prompt": "Click the pricing link and return the plan names"}'
