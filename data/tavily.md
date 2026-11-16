> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# SDK Reference

> Integrate Tavily's powerful APIs natively in your JavaScript/TypeScript projects.

## Instantiating a client

To interact with Tavily in JavaScript, you must instatiate a client with your API key. Our client is asynchronous by default.

Once you have instantiated a client, call one of our supported methods (detailed below) to access the API.

```javascript theme={null}
const { tavily } = require("@tavily/core");

client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
```

### Proxies

If you would like to specify a proxy to be used when making requests, you can do so by passing in a proxy parameter on client instantiation.

Proxy configuration is available in both the synchronous and asynchronous clients.

```javascript theme={null}
const { tavily } = require("@tavily/core");

const proxies = {
  http: "<your HTTP proxy>",
  https: "<your HTTPS proxy>",
};

client = tavily({ apiKey: "tvly-YOUR_API_KEY", proxies });
```

Alternatively, you can specify which proxies to use by setting the `TAVILY_HTTP_PROXY` and `TAVILY_HTTPS_PROXY` variables in your environment file.

### Project Tracking

You can attach a Project ID to your client to organize and track API usage by project. This is useful when a single API key is used across multiple projects.

```javascript theme={null}
const { tavily } = require("@tavily/core");

const client = tavily({
  apiKey: "tvly-YOUR_API_KEY",
  projectId: "your-project-id"
});
```

Alternatively, you can set the `TAVILY_PROJECT` environment variable:

```javascript theme={null}
process.env.TAVILY_PROJECT = "your-project-id";

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });
```

All requests made with this client will include the Project ID, allowing you to filter by project in the [/logs endpoint](https://docs.tavily.com/documentation/api-reference/endpoint/logs.md) and platform usage dashboard.

### Session Tracking

You can attach session and user identifiers to your client for attribution and analytics across multi-step interactions and agent workflows. Each ID is sent as an HTTP header (`X-Session-Id`, `X-Human-Id`) on every request the client makes — across search, extract, crawl, and map.

```javascript theme={null}
const { tavily } = require("@tavily/core");

const client = tavily({
  apiKey: "tvly-YOUR_API_KEY",
  sessionId: "5874812a-2e9b-43ea-8978-6cc9225b587b",
  humanId: "h_4f9ac",
});
```

You can also override either value on a per-call basis:

```javascript theme={null}
const response = await client.search("Who is Leo Messi?", {
  sessionId: "alt-session-id",
  humanId: "alt-human-id",
});
```

For security, Tavily hashes human IDs before processing or storing them. See [Session Tracking](https://docs.tavily.com/documentation/api-headers.md#session-tracking) in the API reference for the underlying header contract.

## Tavily Search

> [!TIP]
>
> **NEW!** Try our interactive [API
> Playground](https://app.tavily.com/playground) to see each parameter in
> action, and generate ready-to-use JavaScript snippets.

You can access Tavily Search in JavaScript through the client's `search` function.

### Parameters

| Parameter | Type | Description | Default |
| :- | :- | :- | :- |
| `query` **(required)** | `string` | The query to run a search on. | — |
| `auto_parameters` | `boolean` | When `auto_parameters` is enabled, Tavily automatically configures search parameters based on your query's content and intent. You can still set other parameters manually, and your explicit values will override the automatic ones. The parameters `include_answer`, `include_raw_content`, and `max_results` must always be set manually, as they directly affect response size. Note: `search_depth` may be automatically set to advanced when it's likely to improve results. This uses 2 API credits per request. To avoid the extra cost, you can explicitly set `search_depth` to `basic`. | `false` |
| `searchDepth` | `string` | The depth of the search. It can be `"basic"` or `"advanced"`. `"advanced"` search is tailored to retrieve the most relevant sources and `content` snippets for your query, while `"basic"` search provides generic content snippets from each source. | `"basic"` |
| `topic` | `string` | The category of the search. Determines which agent will be used. Supported values are `"general"` , `"news"` and `"finance"`. | `"general"` |
| `timeRange` | `string` | The time range back from the current date based on publish date. Accepted values include `"day"`, `"week"`, `"month"`, `"year"` or shorthand values `"d"`, `"w"`, `"m"`, `"y"`. | — |
| `startDate` | `string` | Will return all results after the specified start date based on publish date. Required to be written in the format YYYY-MM-DD | — |
| `endDate` | `string` | Will return all results before the specified end date based on publish date. Required to be written in the format YYYY-MM-DD. | — |
| `maxAgeHours` | `number` | The maximum age in hours of Tavily's cached copy of each result. Accepts `1` to `720`, `0` to always fetch live, or `-1` to never fetch live. See [content freshness](https://docs.tavily.com/documentation/best-practices/best-practices-search.md#by-content-freshness). | — |
| `maxResults` | `number` | The maximum number of search results to return. It must be between `0` and `20`. | `10` |
| `chunksPerSource` | `number` | Chunks are short content snippets (about 500 characters each for `"basic"` and `"fast"`, 800 for `"advanced"`) pulled directly from the source. Use `chunksPerSource` to define the maximum number of relevant chunks returned per source and to control the `content` length. Chunks will appear in the `content` field as: `<chunk 1> [...] <chunk 2> [...] <chunk 3>`. Adjacent chunks may be joined into one longer passage, so chunk length is a target, not a hard limit. Available when `searchDepth` is `"advanced"`, `"basic"` or `"fast"`. | `3` |
| `includeImages` | `boolean` | Include images in the response. Returns both a top-level `images` list of query-related images and an `images` array inside each result object with images extracted from that specific source. | `false` |
| `includeImageDescriptions` | `boolean` | Include a list of query-related images and their descriptions in the response. | `false` |
| `includeAnswer` | `boolean` or `string` | Include an answer to the query generated by an LLM based on search results. A `"basic"` (or `true`) answer is quick but less detailed; an `"advanced"` answer is more detailed. | `false` |
| `includeRawContent` | `boolean` or `string` | Include the cleaned and parsed HTML content of each search result. `"markdown"` or `True` returns search result content in markdown format. `"text"` returns the plain text from the results and may increase latency. | `False` |
| `includeDomains` | `string[]` | A list of domains to specifically include in the search results. Maximum 300 domains. | `[]` |
| `excludeDomains` | `string[]` | A list of domains to specifically exclude from the search results. Maximum 150 domains. | `[]` |
| `includeDomainsMode` | `string` | Controls how `includeDomains` is applied. `"restrict"` limits results to only the listed domains. `"prefer"` also searches the rest of the web, so results outside `includeDomains` can still surface, rather than excluding them. Defaults to `"restrict"`, so `includeDomains` acts as a hard filter unless set to `"prefer"`. Requires `includeDomains` to be set. | `"restrict"` |
| `country` | `string` | Boost search results from a specific country. This will prioritize content from the selected country in the search results. Available only if topic is `general`. | — |
| `language` | `string` | Boost search results in a specific language. Accepts an ISO 639-1 code (e.g. `"en"`, `"fr"`, `"zh-cn"`) or an English language name (e.g. `"english"`, `"french"`). By default this only boosts matching-language results in ranking; pass `filterByLanguage: true` to strictly filter out non-matching results instead. For best results, write your `query` in the same language you set here. | — |
| `filterByLanguage` | `boolean` | Strictly filter out search results that don't match the `language` parameter, instead of only boosting them in ranking. Requires `language` to be set. | `false` |
| `timeout` | `number` | A timeout to be used in requests to the Tavily API. | `60` |
| `exactMatch` | `boolean` | Ensure that only search results containing the exact quoted phrase(s) in your query are returned, bypassing synonyms or semantic variations. Wrap target phrases in quotes (e.g. `"John Smith"`). Punctuation is typically ignored inside quotes. | `false` |
| `includeFavicon` | `boolean` | Whether to include the favicon URL for each result. | `false` |
| `includeUsage` | `boolean` | Whether to include credit usage information in the response. | `false` |

### Response format

The response object you receive will be in the following format:

| Key | Type | Description |
| :- | :- | :- |
| `results` | `Result[]` | A list of sorted search results ranked by relevancy. |
| `query` | `string` | Your search query. |
| `responseTime` | `number` | Your search result response time. |
| `requestId` | `string` | A unique request identifier you can share with customer support to help resolve issues with specific requests. |
| `answer` (optional) | `string` | The answer to your search query, generated by an LLM based on Tavily's search results. This is only available if `includeAnswer` is set to `true`. |
| `images` (optional) | `string[]` or `ImageResult[]` | This is only available if `includeImages` is set to `true`. A list of query-related image URLs. If `includeImageDescriptions` is set to `true`, each entry will be an `ImageResult`. When `includeImages` is `true`, each result in `results` will also contain its own `images` list with images extracted from that specific source. |
| `favicon` (optional) | `string` | The favicon URL for the search result. |

### Results

Each result in the `results` list will be in the following `Result` format:

| Key | Type | Description |
| :- | :- | :- |
| `title` | `string` | The title of the search result. |
| `url` | `string` | The URL of the search result. |
| `content` | `string` | The most query-related content from the scraped URL. Tavily uses proprietary AI to extract the most relevant content based on context quality and size. |
| `score` | `float` | The relevance score of the search result. |
| `rawContent` (optional) | `string` | The parsed and cleaned HTML content of the site. This is only available if `includeRawContent` is set to `true`. |
| `favicon` (optional) | `string` | The favicon URL for the result. |
| `images` (optional) | `string[]` or `ImageResult[]` | Images extracted from this search result. Only included when `includeImages` is set to `true`. If `includeImageDescriptions` is set to `true`, each entry will be an `ImageResult`. |

#### Image Results

Each image in the `images` list will be in the following `ImageResult` format:

| Key | Type | Description |
| :- | :- | :- |
| `url` | `string` | The URL of the image. |
| `description` (optional) | `string` | This is only available if `includeImageDescriptions` is set to `true`. An LLM-generated description of the image. |

### Example

> [accordion] Request
>
> ```javascript theme={null}
> const { tavily } = require("@tavily/core");
>
> // Step 1. Instantiating your Tavily client
> const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
>
> // Step 2. Executing a simple search query
> const response = await tvly.search("Who is Leo Messi?");
>
> // Step 3. That's it! You've done a Tavily Search!
> console.log(response);
> ```

> [accordion] Response
>
> ```json theme={null}
> {
>   "query": "Who is Leo Messi?",
>   "images": [
>     {
>       "url": "Image 1 URL",
>       "description": "Image 1 Description"
>     },
>     {
>       "url": "Image 2 URL",
>       "description": "Image 2 Description"
>     },
>     {
>       "url": "Image 3 URL",
>       "description": "Image 3 Description"
>     },
>     {
>       "url": "Image 4 URL",
>       "description": "Image 4 Description"
>     },
>     {
>       "url": "Image 5 URL",
>       "description": "Image 5 Description"
>     }
>   ],
>   "results": [
>     {
>       "title": "Source 1 Title",
>       "url": "Source 1 URL",
>       "content": "Source 1 Content",
>       "score": 0.99,
>       "favicon": "https://source1.com/favicon.ico",
>       "images": [
>         {
>           "url": "Source 1 Image 1 URL",
>           "description": "Source 1 Image 1 Description"
>         },
>         {
>           "url": "Source 1 Image 2 URL",
>           "description": "Source 1 Image 2 Description"
>         }
>       ],
>       "id": "a3f9c2-00"
>     },
>     {
>       "title": "Source 2 Title",
>       "url": "Source 2 URL",
>       "content": "Source 2 Content",
>       "score": 0.97,
>       "favicon": "https://source2.com/favicon.ico",
>       "images": [],
>       "id": "7b1e04-01"
>     }
>   ],
>   "responseTime": 1.09,
>   "requestId": "123e4567-e89b-12d3-a456-426614174111"
> }
> ```

### Exact Match Example

Use `exactMatch` with quoted phrases in your query to find results containing a specific name or phrase verbatim:

```javascript theme={null}
const { tavily } = require("@tavily/core");

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });

const response = await client.search('"John Smith" CEO Acme Corp', {
  exactMatch: true
});
```

## Tavily Extract

You can access Tavily Extract in JavaScript through the client's `extract` function.

### Parameters

| Parameter | Type | Description | Default |
| :- | :- | :- | :- |
| `urls` **(required)** | `string[]` | The URLs you want to extract. The list must not contain more than 20 URLs. | — |
| `includeImages` | `boolean` | Include a list of images extracted from the URLs in the response. | `false` |
| `extractDepth` | `string` | The depth of the extraction process. You may experience higher latency with `"advanced"` extraction, but it offers a higher success rate and retrieves more data from the URL (e.g., tables, embedded content). `"basic"` extraction costs 1 API Credit per 5 successful URL extractions, while `"advanced"` extraction costs 2 API Credits per 5 successful URL extractions. | `"basic"` |
| `format` | `str` | The format of the extracted web page content. `"markdown"` returns content in markdown format. `"text"` returns plain text and may increase latency. | `"markdown"` |
| `timeout` | `number` | A timeout to be used in requests to the Tavily API.  Maximum time in seconds to wait for the URL extraction before timing out. Must be between 1.0 and 60.0 seconds. If not specified, default timeouts are applied based on extract\_depth: 10 seconds for basic extraction and 30 seconds for advanced extraction. | `None` |
| `includeFavicon` | `boolean` | Whether to include the favicon URL for each result. | `false` |
| `includeUsage` | `boolean` | Whether to include credit usage information in the response.`NOTE:`The value may be 0 if the total successful URL extractions has not yet reached 5 calls. See our [Credits & Pricing documentation](https://docs.tavily.com/documentation/api-credits.md) for details. | `false` |
| `query` | `string` | User intent for reranking extracted content chunks. When provided, chunks are reranked based on relevance to this query. | — |
| `chunksPerSource` | `number` | Chunks are short content snippets (about 800 characters each) pulled directly from the source. Use `chunksPerSource` to define the maximum number of relevant chunks returned per source and to control the `rawContent` length. Chunks will appear in the `rawContent` field as: `<chunk 1> [...] <chunk 2> [...] <chunk 3>`. If a page splits into no more chunks than `chunksPerSource`, its full content is returned. Available only when `query` is provided. Must be between 1 and 5. | `3` |

### Response format

The response object you receive will be in the following format:

| Key | Type | Description |
| :- | :- | :- |
| `results` | `SuccessfulResult[]` | A list of extracted content. |
| `failed_results` | `FailedResult[]` | A list of URLs that could not be processed. |
| `response_time` | `number` | The search result response time. |
| `requestId` | `string` | A unique request identifier you can share with customer support to help resolve issues with specific requests. |

#### Successful Results

Each successful result in the `results` list will be in the following `SuccessfulResult` format:

| Key | Type | Description |
| :- | :- | :- |
| `url` | `string` | The URL of the webpage. |
| `raw_content` | `string` | The raw content extracted. When `query` is provided, contains the top-ranked chunks joined by `[...]` separator. |
| `images` (optional) | `string[]` | This is only available if `includeImages` is set to `true`. A list of extracted image URLs. |
| `favicon` (optional) | `string` | The favicon URL for the result. |

#### Failed Results

Each failed result in the `results` list will be in the following `FailedResult` format:

| Key | Type | Description |
| :- | :- | :- |
| `url` | `string` | The URL that failed. |
| `error` | `string` | An error message describing why it could not be processed. |

### Example

> [accordion] Request
>
> ```python theme={null}
> from tavily import TavilyClient
>
> # Step 1. Instantiating your TavilyClient
> tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
>
> # Step 2. Defining the list of URLs to extract content from
> urls = [
>     "https://en.wikipedia.org/wiki/Artificial_intelligence",
>     "https://en.wikipedia.org/wiki/Machine_learning",
>     "https://en.wikipedia.org/wiki/Data_science",
> ]
>
> # Step 3. Executing the extract request
> response = tavily_client.extract(urls=urls, include_images=True)
>
> # Step 4. Printing the extracted raw content
> print(response)
> ```

> [accordion] Response
>
> ```javascript theme={null}
> {
>   "results": [
>     {
>       "url": "https://en.wikipedia.org/wiki/Artificial_intelligence",
>       "rawContent": "URL 1 raw content",
>       "images": [
>         "Image 1 URL",
>         "Image 2 URL"
>       ],
>       "favicon": "https://en.wikipedia.org/favicon.ico"
>     },
>     {
>       "url": "https://en.wikipedia.org/wiki/Machine_learning",
>       "rawContent": "URL 2 raw content",
>       "images": [
>         "Image 3 URL",
>         "Image 4 URL"
>       ],
>       "favicon": "https://en.wikipedia.org/favicon.ico"
>     },
>     {
>       "url": "https://en.wikipedia.org/wiki/Data_science",
>       "rawContent": "URL 3 raw content",
>       "images": [
>         "Image 5 URL",
>         "Image 6 URL"
>       ],
>       "favicon": "https://en.wikipedia.org/favicon.ico"
>     }
>   ],
>   "failedResults": [],
>   "responseTime": 1.23,
>   "requestId": "123e4567-e89b-12d3-a456-426614174111"
> }
> ```

## Tavily Crawl

You can access Tavily Crawl in JavaScript through the client's `crawl` function.

### Parameters

| Parameter | Type | Description | Default |
| :- | :- | :- | :- |
| `url` **(required)** | `string` | The root URL to begin the crawl. | — |
| `maxDepth` | `number` | Max depth of the crawl. Defines how far from the base URL the crawler can explore. | `1` |
| `maxBreadth` | `number` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |
| `limit` | `number` | Total number of links the crawler will process before stopping. | `50` |
| `instructions` | `string` | Natural language instructions for the crawler. | — |
| `selectPaths` | `string[]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `"/docs/.*"`, `"/api/v1.*"`). | `[]` |
| `selectDomains` | `string[]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `"^docs\.example\.com$"`). | `[]` |
| `excludePaths` | `string[]` | **Regex patterns** to exclude URLs with specific path patterns (e.g., `"/admin/.*"`, `"/private/.*"`). | `[]` |
| `excludeDomains` | `string[]` | **Regex patterns** to exclude specific domains or subdomains from crawling (e.g., `"^admin\.example\.com$"`). | `[]` |
| `allowExternal` | `boolean` | Whether to return links from external domains in crawl output. | `true` |
| `includeImages` | `boolean` | Whether to extract image URLs from the crawled pages. | `false` |
| `extractDepth` | `string` | Advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency. Options: `"basic"` or `"advanced"`. | `"basic"` |
| `format` | `str` | The format of the extracted web page content. `"markdown"` returns content in markdown format. `"text"` returns plain text and may increase latency. | `"markdown"` |
| `timeout` | `number` | Maximum time in seconds to wait for the crawl operation before timing out. Must be between 10 and 150 seconds. | `150` |
| `includeFavicon` | `boolean` | Whether to include the favicon URL for each result. | `false` |
| `includeUsage` | `boolean` | Whether to include credit usage information in the response.`NOTE:`The value may be 0 if the total use of /extract and /map calls has not yet reached minimum needed. See our [Credits & Pricing documentation](https://docs.tavily.com/documentation/api-credits.md) for details. | `false` |
| `chunksPerSource` | `number` | Chunks are short content snippets (about 800 characters each) pulled directly from the source. Use `chunksPerSource` to define the maximum number of relevant chunks returned per source and to control the `rawContent` length. Chunks will appear in the `rawContent` field as: `<chunk 1> [...] <chunk 2> [...] <chunk 3>`. If a page splits into no more chunks than `chunksPerSource`, its full content is returned. Must be between 1 and 5. | `3` |

### Response format

The response object you receive will be in the following format:

| Key | Type | Description |
| :- | :- | :- |
| `baseUrl` | `string` | The URL you started the crawl from. |
| `results` | `Result[]` | A list of crawled pages. |
| `responseTime` | `number` | The crawl response time. |
| `requestId` | `string` | A unique request identifier you can share with customer support to help resolve issues with specific requests. |

#### Results

Each successful result in the `results` list will be in the following `Result` format:

| Key | Type | Description |
| :- | :- | :- |
| `url` | `string` | The URL of the webpage. |
| `rawContent` | `string` | The raw content extracted. |
| `images` | `string[]` | Image URLs extracted from the page. |
| `favicon` (optional) | `string` | The favicon URL for the result. |

### Example

> [accordion] Request
>
> ```javascript theme={null}
> const { tavily } = require("@tavily/core");
>
> // Step 1. Instantiating your Tavily client
> const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
>
> // Step 2. Defining the starting URL of the crawl
> const url = "https://docs.tavily.com";
>
> // Step 3. Executing the crawl with some guidance parameters
> const response = await client.crawl(url, { instructions: "Find all info on the Python SDK" });
>
> // Step 4. Printing the crawled results
> console.log(response);
> ```

> [accordion] Response
>
> ````javascript theme={null}
> {
>   responseTime: 9.09,
>   baseUrl: "https://docs.tavily.com",
>   results: [
>     {
>       "url": "https://docs.tavily.com/sdk/python/reference",
>       "raw_content": "SDK Reference - Tavily Docs\n\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\n\nSearch or ask...\n\nCtrl K\n\n- [Support](mailto:support@tavily.com)\n- [Get an API key](https://app.tavily.com)\n- [Get an API key](https://app.tavily.com)\n\nSearch...\n\nNavigation\n\nPython\n\nSDK Reference\n\n[Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)\n\n- [API Playground](https://app.tavily.com/playground)\n- [Community](https://community.tavily.com)\n- [Blog](https://blog.tavily.com)\n\n##### Python\n\n- [Quickstart](/sdk/python/quick-start)\n- [SDK Reference](/sdk/python/reference)\n\n##### JavaScript\n\n- [Quickstart](/sdk/javascript/quick-start)\n- [SDK Reference](/sdk/javascript/reference)\n\nPython\n\n# SDK Reference\n\nIntegrate Tavily's powerful APIs natively in your Python apps.\n\n## [​](#instantiating-a-client) Instantiating a client\n\nTo interact with Tavily in Python, you must instatiate a client with your API key. For greater flexibility, we provide both a synchronous and an asynchronous client class.\n\nOnce you have instantiated a client, call one of our supported methods (detailed below) to access the API.\n\n### [​](#synchronous-client) Synchronous Client\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\nclient = TavilyClient(\"tvly-YOUR_API_KEY\")\n\n```\n\n### [​](#asynchronous-client) Asynchronous Client\n\nCopy\n\n```\nfrom tavily import AsyncTavilyClient\n\nclient = AsyncTavilyClient(\"tvly-YOUR_API_KEY\")\n\n```\n\n### [​](#proxies) Proxies\n\nIf you would like to specify a proxy to be used when making requests, you can do so by passing in a proxy parameter on client instantiation.\n\nProxy configuration is available in both the synchronous and asynchronous clients.\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\nproxies = {\n  \"http\": \"<your HTTP proxy>\",\n  \"https\": \"<your HTTPS proxy>\",\n}\n\nclient = TavilyClient(\"tvly-YOUR_API_KEY\", proxies=proxies)\n\n```\n\nAlternatively, you can specify which proxies to use by setting the `TAVILY_HTTP_PROXY` and `TAVILY_HTTPS_PROXY` variables in your environment file.\n\n## [​](#tavily-search) Tavily Search\n\n**NEW!** Try our interactive [API\nPlayground](https://app.tavily.com/playground) to see each parameter in\naction, and generate ready-to-use Python snippets.\n\nYou can access Tavily Search in Python through the client's `search` function.\n\n### [​](#parameters) Parameters\n\n| Parameter | Type | Description | Default |  |\n| --- | --- | --- | --- | --- |\n| `query` **(required)** | `str` | The query to run a search on. | — |  |\n| `search_depth` | `str` | The depth of the search. It can be `\"basic\"` or `\"advanced\"`. `\"advanced\"` search is tailored to retrieve the most relevant sources and `content` snippets for your query, while `\"basic\"` search provides generic content snippets from each source. | `\"basic\"` |  |\n| `topic` | `str` | The category of the search. Determines which agent will be used. Supported values are `\"general\"` and `\"news\"`. | `\"general\"` |  |\n| `days` | `int` | The number of days back from the current date to include in the results. Available only when using the `\"news\"` topic. | `7` |  |\n| `time_range` | `str` | The time range back from the current date. Accepted values include `\"day\"`, `\"week\"`, `\"month\"`, `\"year\"` or shorthand values `\"d\"`, `\"w\"`, `\"m\"`, `\"y\"`. | — |  |\n| `max_results` | `int` | The maximum number of search results to return. It must be between `0` and `20`. | `5` |  |\n| `chunks_per_source` | `int` | The number of `content` chunks to retrieve from each source. Each chunk's length is maximum 500 characters. It must be between `1` and `3`. Available only when `search_depth` is `advanced`. | `3` |  |\n| `include_images` | `bool` | Include a list of query-related images in the response. | `False` |  |\n| `include_image_descriptions` | `bool` | Include a list of query-related images and their descriptions in the response. | `False` |  |\n| `include_answer` | `bool` or `str` | Include an answer to the query generated by an LLM based on search results. A `\"basic\"` (or `True`) answer is quick but less detailed; an `\"advanced\"` answer is more detailed. | `False` |  |\n| `include_raw_content` | `bool` | Include the cleaned and parsed HTML content of each search result. | `False` |  |\n| `include_domains` | `list[str]` | A list of domains to specifically include in the search results. | `[]` |  |\n| `exclude_domains` | `list[str]` | A list of domains to specifically exclude from the search results. | `[]` |  |\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\n\n### [​](#response-format) Response format\n\nThe response object you receive will be in the following format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `results` | `list[Result]` | A list of sorted search results ranked by relevancy. |\n| `query` | `str` | Your search query. |\n| `response_time` | `float` | Your search result response time. |\n| `answer` (optional) | `str` | The answer to your search query, generated by an LLM based on Tavily's search results. This is only available if `include_answer` is set to `True`. |\n| `images` (optional) | `list[str]` or `list[ImageResult]` | This is only available if `include_images` is set to `True`. A list of query-related image URLs. If `include_image_descriptions` is set to `True`, each entry will be an `ImageResult`. |\n\n### [​](#results) Results\n\n| `Key` | `Type` | Description |\n| --- | --- | --- |\n| `title` | `str` | The title of the search result. |\n| `url` | `str` | The URL of the search result. |\n| `content` | `str` | The most query-related content from the scraped URL. Tavily uses proprietary AI to extract the most relevant content based on context quality and size. |\n| `score` | `float` | The relevance score of the search result. |\n| `raw_content` (optional) | `str` | The parsed and cleaned HTML content of the site. This is only available if `include_raw_content` is set to `True`. |\n| `published_date` (optional) | `str` | The publication date of the source. This is only available if the search `topic` is set to `\"news\"`. |\n\n#### [​](#image-results) Image Results\n\nIf `includeImageDescriptions` is set to `true`, each image in the `images` list will be in the following `ImageResult` format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `url` | `string` | The URL of the image. |\n| `description` | `string` | An LLM-generated description of the image. |\n\n### [​](#example) Example\n\nRequest\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\n# Step 1. Instantiating your TavilyClient\ntavily_client = TavilyClient(api_key=\"tvly-YOUR_API_KEY\")\n\n# Step 2. Executing the search request\nresponse = tavily_client.search(\"Who is Leo Messi?\", include_images=True, include_image_descriptions=True)\n\n# Step 3. Printing the search results\nprint(response)\n\n```\n\nResponse\n\nCopy\n\n```\n{\n  \"query\": \"Who is Leo Messi?\",\n  \"images\": [\n    {\n      \"url\": \"Image 1 URL\",\n      \"description\": \"Image 1 Description\",\n    },\n    {\n      \"url\": \"Image 2 URL\",\n      \"description\": \"Image 2 Description\",\n    },\n    {\n      \"url\": \"Image 3 URL\",\n      \"description\": \"Image 3 Description\",\n    },\n    {\n      \"url\": \"Image 4 URL\",\n      \"description\": \"Image 4 Description\",\n    },\n    {\n      \"url\": \"Image 5 URL\",\n      \"description\": \"Image 5 Description\",\n    }\n  ],\n  \"results\": [\n    {\n      \"title\": \"Source 1 Title\",\n      \"url\": \"Source 1 URL\",\n      \"content\": \"Source 1 Content\",\n      \"score\": 0.99\n    },\n    {\n      \"title\": \"Source 2 Title\",\n      \"url\": \"Source 2 URL\",\n      \"content\": \"Source 2 Content\",\n      \"score\": 0.97\n    }\n  ],\n  \"response_time\": 1.09\n}\n\n```\n\n## [​](#tavily-extract) Tavily Extract\n\nYou can access Tavily Extract in Python through the client's `extract` function.\n\n### [​](#parameters-2) Parameters\n\n| Parameter | Type | Description | Default |  |\n| --- | --- | --- | --- | --- |\n| `urls` **(required)** | `str` or `list[str]` | The URL (or URLs) you want to extract. If a list is provided, it must not contain more than 20 URLs. | — |  |\n| `include_images` | `bool` | Include a list of images extracted from the URLs in the response. | `False` |  |\n| `extract_depth` | `str` | The depth of the extraction process. You may experience higher latency with `\"advanced\"` extraction, but it offers a higher success rate and retrieves more data from the URL (e.g., tables, embedded content). `\"basic\"` extraction costs 1 API Credit per 5 successful URL extractions, while `advanced` extraction costs 2 API Credits per 5 successful URL extractions. | `\"basic\"` |  |\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\n\n### [​](#response-format-2) Response format\n\nThe response object you receive will be in the following format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `results` | `list[SuccessfulResult]` | A list of extracted content. |\n| `failed_results` | `list[FailedResult]` | A list of URLs that could not be processed. |\n| `response_time` | `float` | The search result response time. |\n\n#### [​](#successful-results) Successful Results\n\nEach successful result in the `results` list will be in the following `SuccessfulResult` format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `url` | `str` | The URL of the webpage. |\n| `raw_content` | `str` | The raw content extracted. |\n| `images` (optional) | `list[str]` | This is only available if `include_images` is set to `True`. A list of extracted image URLs. |\n\n#### [​](#failed-results) Failed Results\n\nEach failed result in the `results` list will be in the following `FailedResult` format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `url` | `str` | The URL that failed. |\n| `error` | `str` | An error message describing why it could not be processed. |\n\n### [​](#example-2) Example\n\nRequest\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\n# Step 1. Instantiating your TavilyClient\ntavily_client = TavilyClient(api_key=\"tvly-YOUR_API_KEY\")\n\n# Step 2. Defining the list of URLs to extract content from\nurls = [\n    \"https://en.wikipedia.org/wiki/Artificial_intelligence\",\n    \"https://en.wikipedia.org/wiki/Machine_learning\",\n    \"https://en.wikipedia.org/wiki/Data_science\",\n]\n\n# Step 3. Executing the extract request\nresponse = tavily_client.extract(urls=urls, include_images=True)\n\n# Step 4. Printing the extracted raw content\nprint(response)\n\n```\n\nResponse\n\nCopy\n\n```\n{\n    \"results\": [\n        {\n            \"url\": \"https://en.wikipedia.org/wiki/Artificial_intelligence\",\n            \"raw_content\": \"URL 1 raw content\",\n            \"images\": [\n                \"Image 1 URL\",\n                \"Image 2 URL\"\n            ]\n        },\n        {\n            \"url\": \"https://en.wikipedia.org/wiki/Machine_learning\",\n            \"raw_content\": \"URL 2 raw content\",\n            \"images\": [\n                \"Image 3 URL\",\n                \"Image 4 URL\"\n            ]\n        },\n        {\n            \"url\": \"https://en.wikipedia.org/wiki/Data_science\",\n            \"raw_content\": \"URL 3 raw content\",\n            \"images\": [\n                \"Image 5 URL\",\n                \"Image 6 URL\"\n            ]\n        }\n    ],\n    \"failed_results\": [],\n    \"response_time\": 1.23\n}\n\n```\n\n## [​](#tavily-crawl) Tavily Crawl\n\nYou can access Tavily Crawl in Python through the `crawl` function.\n\n### [​](#parameters-3) Parameters\n\n| Parameter | Type | Description | Default |\n| --- | --- | --- | --- |\n| `url` **(required)** | `str` | The root URL to begin the crawl. | — |\n| `max_depth` | `int` | Max depth of the crawl. Defines how far from the base URL the crawler can explore. | `1` |\n| `max_breadth` | `int` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |\n| `limit` | `int` | Total number of links the crawler will process before stopping. | `50` |\n| `query` | `str` | Natural language instructions for the crawler. | — |\n| `select_paths` | `list[str]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `\"/docs/.*\"`, `\"/api/v1.*\"`). | `None` |\n| `select_domains` | `list[str]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `\"^docs\\.example\\.com$\"`). | `None` |\n| `allow_external` | `bool` | Whether to allow following links that go to external domains. | `False` |\n| `include_images` | `bool` | Whether to extract image URLs from the crawled pages. | `False` |\n| `extract_depth` | `str` | Advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency. Options: `\"basic\"` or `\"advanced\"`. | `\"basic\"` |\n\n### [​](#response-format-3) Response format\n\nThe response object you receive will be in the following format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `base_url` | `str` | The URL you started the crawl from. |\n| `results` | `list[Result]` | A list of crawled pages. |\n| `response_time` | `float` | The crawl response time. |\n\n#### [​](#results-2) Results\n\nEach successful result in the `results` list will be in the following `Result` format:\n\n| Key | Type | Description |\n| --- | --- | --- |\n| `url` | `str` | The URL of the webpage. |\n| `raw_content` | `str` | The raw content extracted. |\n| `images` | `list[str]` | Image URLs extracted from the page. |\n\n### [​](#example-3) Example\n\nRequest\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\n# Step 1. Instantiating your TavilyClient\ntavily_client = TavilyClient(api_key=\"tvly-YOUR_API_KEY\")\n\n# Step 2. Defining the starting URL of the crawl\nurl = \"https://docs.tavily.com\"\n\n# Step 3. Executing the crawl with some guidance parameters\nresponse = tavily_client.crawl(url, query=\"Python SDK\")\n\n# Step 4. Printing the crawled results\nprint(response)\n\n```\n\nResponse\n\nCopy\n\n```\n{\n    \"base_url\": \"https://docs.tavily.com\",\n    \"results\": [\n        {\n            \"url\": \"https://docs.tavily.com/sdk/python/reference\",\n            \"raw_content\": \"SDK Reference - Tavily Docs\\n\\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\\n\\nSearch or ask...\\n\\nCtrl K\\n\\n- [Support](mailto:support@tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n\\nSearch...\\n\\nNavigation\\n\\nPython\\n\\nSDK Reference\\n\\n[Home](https://docs.tavily.com/welcome.md)[Documentation](https://docs.tavily.com/documentation/about.md)[SDKs](https://docs.tavily.com/sdk/python/quick-start.md)[Examples](https://docs.tavily.com/examples/use-cases/data-enrichment.md)[FAQ](https://docs.tavily.com/faq/faq.md)\\n\\n- [API Playground](https://app.tavily.com/playground)\\n- [Community](https://community.tavily.com)\\n- [Blog](https://blog.tavily.com)\\n\\n##### Python\\n\\n- [Quickstart](https://docs.tavily.com/sdk/python/quick-start.md)\\n- [SDK Reference](https://docs.tavily.com/sdk/python/reference.md)\\n\\n##### JavaScript\\n\\n- [Quickstart](https://docs.tavily.com/sdk/javascript/quick-start.md)\\n- [SDK Reference](https://docs.tavily.com/sdk/javascript/reference.md)\\n\\nPython\\n\\n# SDK Reference\\n\\nIntegrate Tavily's powerful APIs natively in your Python apps.\\n\\n## [\\u200b](#instantiating-a-client) Instantiating a client\\n\\nTo interact with Tavily in Python, you must instatiate a client with your API key. For greater flexibility, we provide both a synchronous and an asynchronous client class.\\n\\nOnce you have instantiated a client, call one of our supported methods (detailed below) to access the API.\\n\\n### [\\u200b](#synchronous-client) Synchronous Client\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\nclient = TavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\n### [\\u200b](#asynchronous-client) Asynchronous Client\\n\\nCopy\\n\\n```\\nfrom tavily import AsyncTavilyClient\\n\\nclient = AsyncTavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\n### [\\u200b](#proxies) Proxies\\n\\nIf you would like to specify a proxy to be used when making requests, you can do so by passing in a proxy parameter on client instantiation.\\n\\nProxy configuration is available in both the synchronous and asynchronous clients.\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\nproxies = {\\n  \\\"http\\\": \\\"<your HTTP proxy>\\\",\\n  \\\"https\\\": \\\"<your HTTPS proxy>\\\",\\n}\\n\\nclient = TavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\nAlternatively, you can specify which proxies to use by setting the `TAVILY_HTTP_PROXY` and `TAVILY_HTTPS_PROXY` variables in your environment file.\\n\\n## [\\u200b](#tavily-search) Tavily Search\\n\\n**NEW!** Try our interactive [API\\nPlayground](https://app.tavily.com/playground) to see each parameter in\\naction, and generate ready-to-use Python snippets.\\n\\nYou can access Tavily Search in Python through the client's `search` function.\\n\\n### [\\u200b](#parameters) Parameters\\n\\n| Parameter | Type | Description | Default |  |\\n| --- | --- | --- | --- | --- |\\n| `query` **(required)** | `str` | The query to run a search on. |  |  |\\n| `search_depth` | `str` | The depth of the search. It can be `\\\"basic\\\"` or `\\\"advanced\\\"`. `\\\"advanced\\\"` search is tailored to retrieve the most relevant sources and `content` snippets for your query, while `\\\"basic\\\"` search provides generic content snippets from each source. | `\\\"basic\\\"` |  |\\n| `topic` | `str` | The category of the search. Determines which agent will be used. Supported values are `\\\"general\\\"` and `\\\"news\\\"`. | `\\\"general\\\"` |  |\\n| `days` | `int` | The number of days back from the current date to include in the results. Available only when using the `\\\"news\\\"` topic. | `7` |  |\\n| `time_range` | `str` | The time range back from the current date. Accepted values include `\\\"day\\\"`, `\\\"week\\\"`, `\\\"month\\\"`, `\\\"year\\\"` or shorthand values `\\\"d\\\"`, `\\\"w\\\"`, `\\\"m\\\"`, `\\\"y\\\"`. |  |  |\\n| `max_results` | `int` | The maximum number of search results to return. It must be between `0` and `20`. | `5` |  |\\n| `chunks_per_source` | `int` | The number of `content` chunks to retrieve from each source. Each chunk's length is maximum 500 characters. It must be between `1` and `3`. Available only when `search_depth` is `advanced`. | `3` |  |\\n| `include_images` | `bool` | Include a list of query-related images in the response. | `False` |  |\\n| `include_image_descriptions` | `bool` | Include a list of query-related images and their descriptions in the response. | `False` |  |\\n| `include_answer` | `bool` or `str` | Include an answer to the query generated by an LLM based on search results. A `\\\"basic\\\"` (or `True`) answer is quick but less detailed; an `\\\"advanced\\\"` answer is more detailed. | `False` |  |\\n| `include_raw_content` | `bool` | Include the cleaned and parsed HTML content of each search result. | `False` |  |\\n| `include_domains` | `list[str]` | A list of domains to specifically include in the search results. Maximum 300 domains.  | `[]` |  |\\n| `exclude_domains` | `list[str]` | A list of domains to specifically exclude from the search results. Maximum 150 domains. | `[]` |  |\\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\\n\\n### [\\u200b](#response-format) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `results` | `list[Result]` | A list of sorted search results ranked by relevancy. |\\n| `query` | `str` | Your search query. |\\n| `response_time` | `float` | Your search result response time. |\\n| `answer` (optional) | `str` | The answer to your search query, generated by an LLM based on Tavily's search results. This is only available if `include_answer` is set to `True`. |\\n| `images` (optional) | `list[str]` or `list[ImageResult]` | This is only available if `include_images` is set to `True`. A list of query-related image URLs. If `include_image_descriptions` is set to `True`, each entry will be an `ImageResult`. |\\n\\n### [\\u200b](#results) Results\\n\\n| `Key` | `Type` | Description |\\n| --- | --- | --- |\\n| `title` | `str` | The title of the search result. |\\n| `url` | `str` | The URL of the search result. |\\n| `content` | `str` | The most query-related content from the scraped URL. Tavily uses proprietary AI to extract the most relevant content based on context quality and size. |\\n| `score` | `float` | The relevance score of the search result. |\\n| `raw_content` (optional) | `str` | The parsed and cleaned HTML content of the site. This is only available if `include_raw_content` is set to `True`. |\\n| `published_date` (optional) | `str` | The publication date of the source. This is only available if the search `topic` is set to `\\\"news\\\"`. |\\n\\n#### [\\u200b](#image-results) Image Results\\n\\nIf `includeImageDescriptions` is set to `true`, each image in the `images` list will be in the following `ImageResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `string` | The URL of the image. |\\n| `description` | `string` | An LLM-generated description of the image. |\\n\\n### [\\u200b](#example) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Executing the search request\\nresponse = tavily_client.search(\\\"Who is Leo Messi?\\\", include_images=True, include_image_descriptions=True)\\n\\n# Step 3. Printing the search results\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n  \\\"query\\\": \\\"Who is Leo Messi?\\\",\\n  \\\"images\\\": [\\n    {\\n      \\\"url\\\": \\\"Image 1 URL\\\",\\n      \\\"description\\\": \\\"Image 1 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 2 URL\\\",\\n      \\\"description\\\": \\\"Image 2 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 3 URL\\\",\\n      \\\"description\\\": \\\"Image 3 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 4 URL\\\",\\n      \\\"description\\\": \\\"Image 4 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 5 URL\\\",\\n      \\\"description\\\": \\\"Image 5 Description\\\",\\n    }\\n  ],\\n  \\\"results\\\": [\\n    {\\n      \\\"title\\\": \\\"Source 1 Title\\\",\\n      \\\"url\\\": \\\"Source 1 URL\\\",\\n      \\\"content\\\": \\\"Source 1 Content\\\",\\n      \\\"score\\\": 0.99\\n    },\\n    {\\n      \\\"title\\\": \\\"Source 2 Title\\\",\\n      \\\"url\\\": \\\"Source 2 URL\\\",\\n      \\\"content\\\": \\\"Source 2 Content\\\",\\n      \\\"score\\\": 0.97\\n    }\\n  ],\\n  \\\"response_time\\\": 1.09\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-extract) Tavily Extract\\n\\nYou can access Tavily Extract in Python through the client's `extract` function.\\n\\n### [\\u200b](#parameters-2) Parameters\\n\\n| Parameter | Type | Description | Default |  |\\n| --- | --- | --- | --- | --- |\\n| `urls` **(required)** | `str` or `list[str]` | The URL (or URLs) you want to extract. If a list is provided, it must not contain more than 20 URLs. |  |  |\\n| `include_images` | `bool` | Include a list of images extracted from the URLs in the response. | `False` |  |\\n| `extract_depth` | `str` | The depth of the extraction process. You may experience higher latency with `\\\"advanced\\\"` extraction, but it offers a higher success rate and retrieves more data from the URL (e.g., tables, embedded content). `\\\"basic\\\"` extraction costs 1 API Credit per 5 successful URL extractions, while `advanced` extraction costs 2 API Credits per 5 successful URL extractions. | `\\\"basic\\\"` |  |\\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\\n\\n### [\\u200b](#response-format-2) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `results` | `list[SuccessfulResult]` | A list of extracted content. |\\n| `failed_results` | `list[FailedResult]` | A list of URLs that could not be processed. |\\n| `response_time` | `float` | The search result response time. |\\n\\n#### [\\u200b](#successful-results) Successful Results\\n\\nEach successful result in the `results` list will be in the following `SuccessfulResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL of the webpage. |\\n| `raw_content` | `str` | The raw content extracted. |\\n| `images` (optional) | `list[str]` | This is only available if `include_images` is set to `True`. A list of extracted image URLs. |\\n\\n#### [\\u200b](#failed-results) Failed Results\\n\\nEach failed result in the `results` list will be in the following `FailedResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL that failed. |\\n| `error` | `str` | An error message describing why it could not be processed. |\\n\\n### [\\u200b](#example-2) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Defining the list of URLs to extract content from\\nurls = [\\n    \\\"https://en.wikipedia.org/wiki/Artificial_intelligence\\\",\\n    \\\"https://en.wikipedia.org/wiki/Machine_learning\\\",\\n    \\\"https://en.wikipedia.org/wiki/Data_science\\\",\\n]\\n\\n# Step 3. Executing the extract request\\nresponse = tavily_client.extract(urls=urls, include_images=True)\\n\\n# Step 4. Printing the extracted raw content\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n    \"results\": [\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Artificial_intelligence\\\",\\n            \\\"raw_content\\\": \\\"URL 1 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 1 URL\\\",\\n                \\\"Image 2 URL\\\"\\n            ]\\n        },\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Machine_learning\\\",\\n            \\\"raw_content\\\": \\\"URL 2 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 3 URL\\\",\\n                \\\"Image 4 URL\\\"\\n            ]\\n        },\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Data_science\\\",\\n            \\\"raw_content\\\": \\\"URL 3 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 5 URL\\\",\\n                \\\"Image 6 URL\\\"\\n            ]\\n        }\\n    ],\\n    \"failed_results\": [],\\n    \"response_time\": 1.23\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-crawl) Tavily Crawl\\n\\nYou can access Tavily Crawl in Python through the `crawl` function.\\n\\n### [\\u200b](#parameters-3) Parameters\\n\\n| Parameter | Type | Description | Default |\n| --- | --- | --- | --- |\n| `url` **(required)** | `str` | The root URL to begin the crawl. | — |\n| `max_depth` | `int` | Max depth of the crawl. Defines how far from the base URL the crawler can explore. | `1` |\n| `max_breadth` | `int` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |\n| `limit` | `int` | Total number of links the crawler will process before stopping. | `50` |\n| `query` | `str` | Natural language instructions for the crawler. | — |\n| `select_paths` | `list[str]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `\"/docs/.*\"`, `\"/api/v1.*\"`). | `None` |\n| `select_domains` | `list[str]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `\"^docs\\.example\\.com$\"`). | `None` |\n| `allow_external` | `bool` | Whether to allow following links that go to external domains. | `False` |\n| `include_images` | `bool` | Whether to extract image URLs from the crawled pages. | `False` |\n| `extract_depth` | `str` | Advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency. Options: `\"basic\"` or `\"advanced\"`. | `\"basic\"` |\n\n### [\\u200b](#response-format-3) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `base_url` | `str` | The URL you started the crawl from. |\\n| `results` | `list[Result]` | A list of crawled pages. |\\n| `response_time` | `float` | The crawl response time. |\\n\\n#### [\\u200b](#results-2) Results\\n\\nEach successful result in the `results` list will be in the following `Result` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL of the webpage. |\\n| `raw_content` | `str` | The raw content extracted. |\\n| `images` | `list[str]` | Image URLs extracted from the page. |\\n\\n### [\\u200b](#example-3) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Defining the starting URL of the crawl\\nurl = \\\"https://docs.tavily.com\\\"\\n\\n# Step 3. Executing the crawl with some guidance parameters\\nresponse = tavily_client.crawl(url, query=\\\"Python SDK\\\")\\n\\n# Step 4. Printing the crawled results\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n    \"base_url\": \"https://docs.tavily.com\",\\n    \"results\": [\\n        {\\n            \"url\": \"https://docs.tavily.com/sdk/python/reference\",\\n            \"raw_content\": \"SDK Reference - Tavily Docs\\n\\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\\n\\nSearch or ask...\\n\\nCtrl K\\n\\n- [Support](mailto:support@tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n\\nSearch...\\n\\nNavigation\\n\\nPython\\n\\nSDK Reference\\n\\n[Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)\\n\\n- [API Playground](https://app.tavily.com/playground)\\n- [Community](https://community.tavily.com)\\n- [Blog](https://blog.tavily.com)\\n\\n##### Python\\n\\n- [Quickstart](/sdk/python/quick-start)\\n- [SDK Reference](/sdk/python/reference)\\n\\n##### JavaScript\\n\\n- [Quickstart](/sdk/javascript/quick-start)\\n- [SDK Reference](/sdk/javascript/reference)\\n\\nPython\\n\\n# SDK Reference\\n\\nIntegrate Tavily's powerful APIs natively in your Python apps.\\n\\n## [\\u200b](#instantiating-a-client) Instantiating a client\\n\\nTo interact with Tavily in Python, you must instatiate a client with your API key. For greater flexibility, we provide both a synchronous and an asynchronous client class.\\n\\nOnce you have instantiated a client, call one of our supported methods (detailed below) to access the API.\\n\\n### [\\u200b](#synchronous-client) Synchronous Client\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\nclient = TavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\n### [\\u200b](#asynchronous-client) Asynchronous Client\\n\\nCopy\\n\\n```\\nfrom tavily import AsyncTavilyClient\\n\\nclient = AsyncTavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\n### [\\u200b](#proxies) Proxies\\n\\nIf you would like to specify a proxy to be used when making requests, you can do so by passing in a proxy parameter on client instantiation.\\n\\nProxy configuration is available in both the synchronous and asynchronous clients.\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\nproxies = {\\n  \\\"http\\\": \\\"<your HTTP proxy>\\\",\\n  \\\"https\\\": \\\"<your HTTPS proxy>\\\",\\n}\\n\\nclient = TavilyClient(\\\"tvly-YOUR_API_KEY\\\", proxies=proxies)\\n\\n```\\n\\nAlternatively, you can specify which proxies to use by setting the `TAVILY_HTTP_PROXY` and `TAVILY_HTTPS_PROXY` variables in your environment file.\\n\\n## [\\u200b](#tavily-search) Tavily Search\\n\\n**NEW!** Try our interactive [API\\nPlayground](https://app.tavily.com/playground) to see each parameter in\\naction, and generate ready-to-use Python snippets.\\n\\nYou can access Tavily Search in Python through the client's `search` function.\\n\\n### [\\u200b](#parameters) Parameters\\n\\n| Parameter | Type | Description | Default |  |\\n| --- | --- | --- | --- | --- |\\n| `query` **(required)** | `str` | The query to run a search on. |  |  |\\n| `search_depth` | `str` | The depth of the search. It can be `\\\"basic\\\"` or `\\\"advanced\\\"`. `\\\"advanced\\\"` search is tailored to retrieve the most relevant sources and `content` snippets for your query, while `\\\"basic\\\"` search provides generic content snippets from each source. | `\\\"basic\\\"` |  |\\n| `topic` | `str` | The category of the search. Determines which agent will be used. Supported values are `\\\"general\\\"` and `\\\"news\\\"`. | `\\\"general\\\"` |  |\\n| `days` | `int` | The number of days back from the current date to include in the results. Available only when using the `\\\"news\\\"` topic. | `7` |  |\\n| `time_range` | `str` | The time range back from the current date. Accepted values include `\\\"day\\\"`, `\\\"week\\\"`, `\\\"month\\\"`, `\\\"year\\\"` or shorthand values `\\\"d\\\"`, `\\\"w\\\"`, `\\\"m\\\"`, `\\\"y\\\"`. |  |  |\\n| `max_results` | `int` | The maximum number of search results to return. It must be between `0` and `20`. | `5` |  |\\n| `chunks_per_source` | `int` | The number of `content` chunks to retrieve from each source. Each chunk's length is maximum 500 characters. It must be between `1` and `3`. Available only when `search_depth` is `advanced`. | `3` |  |\\n| `include_images` | `bool` | Include a list of query-related images in the response. | `False` |  |\\n| `include_image_descriptions` | `bool` | Include a list of query-related images and their descriptions in the response. | `False` |  |\\n| `include_answer` | `bool` or `str` | Include an answer to the query generated by an LLM based on search results. A `\\\"basic\\\"` (or `True`) answer is quick but less detailed; an `\\\"advanced\\\"` answer is more detailed. | `False` |  |\\n| `include_raw_content` | `bool` | Include the cleaned and parsed HTML content of each search result. | `False` |  |\\n| `include_domains` | `list[str]` | A list of domains to specifically include in the search results. | `[]` |  |\\n| `exclude_domains` | `list[str]` | A list of domains to specifically exclude from the search results. | `[]` |  |\\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\\n\\n### [\\u200b](#response-format) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `results` | `list[Result]` | A list of sorted search results ranked by relevancy. |\\n| `query` | `str` | Your search query. |\\n| `response_time` | `float` | Your search result response time. |\\n| `answer` (optional) | `str` | The answer to your search query, generated by an LLM based on Tavily's search results. This is only available if `include_answer` is set to `True`. |\\n| `images` (optional) | `list[str]` or `list[ImageResult]` | This is only available if `include_images` is set to `True`. A list of query-related image URLs. If `include_image_descriptions` is set to `True`, each entry will be an `ImageResult`. |\\n\\n### [\\u200b](#results) Results\\n\\n| `Key` | `Type` | Description |\\n| --- | --- | --- |\\n| `title` | `str` | The title of the search result. |\\n| `url` | `str` | The URL of the search result. |\\n| `content` | `str` | The most query-related content from the scraped URL. Tavily uses proprietary AI to extract the most relevant content based on context quality and size. |\\n| `score` | `float` | The relevance score of the search result. |\\n| `raw_content` (optional) | `str` | The parsed and cleaned HTML content of the site. This is only available if `include_raw_content` is set to `True`. |\\n| `published_date` (optional) | `str` | The publication date of the source. This is only available if the search `topic` is set to `\\\"news\\\"`. |\\n\\n#### [\\u200b](#image-results) Image Results\\n\\nIf `includeImageDescriptions` is set to `true`, each image in the `images` list will be in the following `ImageResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `string` | The URL of the image. |\\n| `description` | `string` | An LLM-generated description of the image. |\\n\\n### [\\u200b](#example) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Executing the search request\\nresponse = tavily_client.search(\\\"Who is Leo Messi?\\\", include_images=True, include_image_descriptions=True)\\n\\n# Step 3. Printing the search results\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n  \\\"query\\\": \\\"Who is Leo Messi?\\\",\\n  \\\"images\\\": [\\n    {\\n      \\\"url\\\": \\\"Image 1 URL\\\",\\n      \\\"description\\\": \\\"Image 1 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 2 URL\\\",\\n      \\\"description\\\": \\\"Image 2 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 3 URL\\\",\\n      \\\"description\\\": \\\"Image 3 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 4 URL\\\",\\n      \\\"description\\\": \\\"Image 4 Description\\\",\\n    },\\n    {\\n      \\\"url\\\": \\\"Image 5 URL\\\",\\n      \\\"description\\\": \\\"Image 5 Description\\\",\\n    }\\n  ],\\n  \\\"results\\\": [\\n    {\\n      \\\"title\\\": \\\"Source 1 Title\\\",\\n      \\\"url\\\": \\\"Source 1 URL\\\",\\n      \\\"content\\\": \\\"Source 1 Content\\\",\\n      \\\"score\\\": 0.99\\n    },\\n    {\\n      \\\"title\\\": \\\"Source 2 Title\\\",\\n      \\\"url\\\": \\\"Source 2 URL\\\",\\n      \\\"content\\\": \\\"Source 2 Content\\\",\\n      \\\"score\\\": 0.97\\n    }\\n  ],\\n  \\\"response_time\\\": 1.09\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-extract) Tavily Extract\\n\\nYou can access Tavily Extract in Python through the client's `extract` function.\\n\\n### [\\u200b](#parameters-2) Parameters\\n\\n| Parameter | Type | Description | Default |  |\\n| --- | --- | --- | --- | --- |\\n| `urls` **(required)** | `str` or `list[str]` | The URL (or URLs) you want to extract. If a list is provided, it must not contain more than 20 URLs. |  |  |\\n| `include_images` | `bool` | Include a list of images extracted from the URLs in the response. | `False` |  |\\n| `extract_depth` | `str` | The depth of the extraction process. You may experience higher latency with `\\\"advanced\\\"` extraction, but it offers a higher success rate and retrieves more data from the URL (e.g., tables, embedded content). `\\\"basic\\\"` extraction costs 1 API Credit per 5 successful URL extractions, while `advanced` extraction costs 2 API Credits per 5 successful URL extractions. | `\\\"basic\\\"` |  |\\n| `timeout` | `int` | A timeout to be used in requests to the Tavily API. | `60` |  |\\n\\n### [\\u200b](#response-format-2) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `results` | `list[SuccessfulResult]` | A list of extracted content. |\\n| `failed_results` | `list[FailedResult]` | A list of URLs that could not be processed. |\\n| `response_time` | `float` | The search result response time. |\\n\\n#### [\\u200b](#successful-results) Successful Results\\n\\nEach successful result in the `results` list will be in the following `SuccessfulResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL of the webpage. |\\n| `raw_content` | `str` | The raw content extracted. |\\n| `images` (optional) | `list[str]` | This is only available if `include_images` is set to `True`. A list of extracted image URLs. |\\n\\n#### [\\u200b](#failed-results) Failed Results\\n\\nEach failed result in the `results` list will be in the following `FailedResult` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL that failed. |\\n| `error` | `str` | An error message describing why it could not be processed. |\\n\\n### [\\u200b](#example-2) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Defining the list of URLs to extract content from\\nurls = [\\n    \\\"https://en.wikipedia.org/wiki/Artificial_intelligence\\\",\\n    \\\"https://en.wikipedia.org/wiki/Machine_learning\\\",\\n    \\\"https://en.wikipedia.org/wiki/Data_science\\\",\\n]\\n\\n# Step 3. Executing the extract request\\nresponse = tavily_client.extract(urls=urls, include_images=True)\\n\\n# Step 4. Printing the extracted raw content\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n    \\\"results\\\": [\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Artificial_intelligence\\\",\\n            \\\"raw_content\\\": \\\"URL 1 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 1 URL\\\",\\n                \\\"Image 2 URL\\\"\\n            ]\\n        },\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Machine_learning\\\",\\n            \\\"raw_content\\\": \\\"URL 2 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 3 URL\\\",\\n                \\\"Image 4 URL\\\"\\n            ]\\n        },\\n        {\\n            \\\"url\\\": \\\"https://en.wikipedia.org/wiki/Data_science\\\",\\n            \\\"raw_content\\\": \\\"URL 3 raw content\\\",\\n            \\\"images\\\": [\\n                \\\"Image 5 URL\\\",\\n                \\\"Image 6 URL\\\"\\n            ]\\n        }\\n    ],\\n    \\\"failed_results\\\": [],\\n    \\\"response_time\\\": 1.23\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-crawl) Tavily Crawl\\n\\nYou can access Tavily Crawl in Python through the `crawl` function.\\n\\n### [\\u200b](#parameters-3) Parameters\\n\\n| Parameter | Type | Description | Default |\\n| --- | --- | --- | --- |\\n| `url` **(required)** | `str` | The root URL to begin the crawl. | \\u2014 |\\n| `max_depth` | `int` | Max depth of the crawl. Defines how far from the base URL the crawler can explore. | `1` |\\n| `max_breadth` | `int` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |\\n| `limit` | `int` | Total number of links the crawler will process before stopping. | `50` |\\n| `query` | `str` | Natural language instructions for the crawler. | \\u2014 |\\n| `select_paths` | `list[str]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `\"/docs/.*\"`, `\"/api/v1.*\"`). | `None` |\\n| `select_domains` | `list[str]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `\"^docs\\\\.example\\\\.com$\\\"`). | `None` |\\n| `allow_external` | `bool` | Whether to allow following links that go to external domains. | `False` |\\n| `include_images` | `bool` | Whether to extract image URLs from the crawled pages. | `False` |\\n| `extract_depth` | `str` | Advanced extraction retrieves more data, including tables and embedded content, with higher success but may increase latency. Options: `\\\"basic\\\"` or `\\\"advanced\\\"`. | `\\\"basic\\\"` |\\n\\n### [\\u200b](#response-format-3) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `base_url` | `str` | The URL you started the crawl from. |\\n| `results` | `list[Result]` | A list of crawled pages. |\\n| `response_time` | `float` | The crawl response time. |\\n\\n#### [\\u200b](#results-2) Results\\n\\nEach successful result in the `results` list will be in the following `Result` format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `url` | `str` | The URL of the webpage. |\\n| `raw_content` | `str` | The raw content extracted. |\\n\\n### [\\u200b](#example-3) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Defining the starting URL of the crawl\\nurl = \\\"https://docs.tavily.com\\\"\\n\\n# Step 3. Executing the crawl with some guidance parameters\\nresponse = tavily_client.crawl(url, query=\\\"Python SDK\\\")\\n\\n# Step 4. Printing the crawled results\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n    'base_url': 'https://docs.tavily.com',\\n    'results': [\\n        {\\n            'url': 'https://docs.tavily.com/sdk/python/quick-start',\\n            'raw_content': 'Quickstart - Tavily Docs\\\\n\\\\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\\\\n\\\\nSearch or ask...\\\\n\\\\nCtrl K\\\\n\\\\n- [Support](mailto:support@tavily.com)\\\\n- [Get an API key](https://app.tavily.com)\\\\n- [Get an API key](https://app.tavily.com)\\\\n\\\\nSearch...\\\\n\\\\nNavigation\\\\n\\\\nPython\\\\n\\\\nQuickstart\\\\n\\\\n[Home](https://docs.tavily.com/welcome.md)[Documentation](https://docs.tavily.com/documentation/about.md)[SDKs](https://docs.tavily.com/sdk/python/quick-start.md)[Examples](https://docs.tavily.com/examples/use-cases/data-enrichment.md)[FAQ](https://docs.tavily.com/faq/faq.md)\\\\n\\\\n- [API Playground](https://app.tavily.com/playground)\\\\n- [Community](https://community.tavily.com)\\\\n- [Blog](https://blog.tavily.com)\\\\n\\\\n##### Python\\\\n\\\\n- [Quickstart](https://docs.tavily.com/sdk/python/quick-start.md)\\\\n- [SDK Reference](https://docs.tavily.com/sdk/python/reference.md)\\\\n\\\\n##### JavaScript\\\\n\\\\n- [Quickstart](https://docs.tavily.com/sdk/javascript/quick-start.md)\\\\n- [SDK Reference](https://docs.tavily.com/sdk/javascript/reference.md)\\\\n\\\\nPython\\\\n\\\\n# Quickstart\\\\n\\\\nIntegrate Tavily\\\\'s powerful APIs natively in your Python apps.\\\\n\\\\nLooking for the Python SDK Reference? Head to our [Python SDK Reference](https://docs.tavily.com/sdk/python/reference.md) and learn how to use `tavily-python`.\\\\n\\\\n## [\\\\u200b](#introduction) Introduction\\\\n\\\\nThe Python SDK allows for easy interaction with the Tavily API, offering the full range of our search functionality directly from your Python programs. Easily integrate smart search capabilities into your applications, harnessing Tavily\\\\'s powerful search features.\\\\n\\\\n[## GitHub\\\\n\\\\n`/tavily-ai/tavily-python`\\\\n\\\\n![GitHub Repo stars](https://img.shields.io/github/stars/tavily-ai/tavily-python?style=social)](https://github.com/tavily-ai/tavily-python)[## PyPI\\\\n\\\\n`tavily-python`\\\\n\\\\n![PyPI downloads](https://img.shields.io/pypi/dm/tavily-python)](https://pypi.org/project/tavily-python)\\\\n\\\\n## [\\\\u200b](#quickstart) Quickstart\\\\n\\\\nGet started with our Python SDK in less than 5 minutes!\\\\n\\\\n[## Get your free API key\\\\n\\\\nYou get 1,000 free API Credits every month. **No credit card required.**](https://app.tavily.com)\\\\n\\\\n### [\\\\u200b](#installation) Installation\\\\n\\\\nYou can install the Tavily Python SDK using the following:\\\\n\\\\nCopy\\\\n\\\\n```\\\\npip install tavily-python\\\\n\\\\n```\\\\n\\\\n### [\\\\u200b](#usage) Usage\\\\n\\\\nWith Tavily\\\\'s Python SDK, you can search the web in only 4 lines of code:\\\\n\\\\nCopy\\\\n\\\\n```\\\\nfrom tavily import TavilyClient\\\\n\\\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\\\nresponse = tavily_client.search(\\\"Who is Leo Messi?\\\")\\\\n\\\\nprint(response)\\\\n\\\\n```\\\\n\\\\nYou can also easily extract content from URLs:\\\\n\\\\nCopy\\\\n\\\\n```\\\\nfrom tavily import TavilyClient\\\\n\\\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\\\nresponse = tavily_client.extract(\\\"https://en.wikipedia.org/wiki/Lionel_Messi\\\")\\\\n\\\\nprint(response)\\\\n\\\\n```\\\\n\\\\nThese examples are very simple, and you can do so much more with Tavily!\\\\n\\\\n## [\\\\u200b](#features) Features\\\\n\\\\nOur Python SDK supports the full feature range of our [REST API](https://docs.tavily.com/api-reference), and more. We offer both a synchronous and an asynchronous client, for increased flexibility.\\\\n\\\\n- The `search` function lets you harness the full power of Tavily Search.\\\\n- The `extract` function allows you to easily retrieve web content with Tavily Extract.\\\\n\\\\nFor more details, head to the [Python SDK Reference](https://docs.tavily.com/sdk/python/reference.md).\\\\n\\\\n[SDK Reference](https://docs.tavily.com/sdk/python/reference.md)\\\\n\\\\n[x](https://x.com/tavilyai)[github](https://github.com/tavily-ai)[linkedin](https://linkedin.com/company/tavily)[website](https://tavily.com)\\\\n\\\\n[Powered by Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.tavily.com)\\\\n\\\\nOn this page\\\\n\\\\n- [Introduction](#introduction)\\\\n- [Quickstart](#quickstart)\\\\n- [Installation](#installation)\\\\n- [Usage](#usage)\\\\n- [Features](#features)'\\n        }\\n    ],\\n    'response_time': 9.14\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-map) Tavily Map\\n\\nTavily Map allows you to obtain a sitemap starting from a base URL.\\n\\nYou can access Tavily Map in Python through the `map` function.\\n\\n### [\\u200b](#parameters-4) Parameters\\n\\n| Parameter | Type | Description | Default |\\n| --- | --- | --- | --- |\\n| `url` **(required)** | `str` | The root URL to begin the mapping. | \\u2014 |\\n| `max_depth` | `int` | Max depth of the mapping. Defines how far from the base URL the crawler can explore. | `1` |\\n| `max_breadth` | `int` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |\\n| `limit` | `int` | Total number of links the crawler will process before stopping. | `50` |\\n| `query` | `str` | Natural language instructions for the crawler | \\u2014 |\\n| `select_paths` | `str[]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `\\\"/docs/.*\\\"`, `\\\"/api/v1.*\\\"`). | `None` |\\n| `select_domains` | `str[]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `\\\"^docs\\\\.example\\\\.com$\\\"`). | `None` |\\n| `allow_external` | `bool` | Whether to allow following links that go to external domains. | `False` |\\n\\n### [\\u200b](#response-format-4) Response format\\n\\nThe response object you receive will be in the following format:\\n\\n| Key | Type | Description |\\n| --- | --- | --- |\\n| `base_url` | `str` | The URL you started the mapping from. |\\n| `results` | `list[str]` | A list of URLs that were discovered during the mapping. |\\n| `response_time` | `float` | The mapping response time. |\\n\\n### [\\u200b](#example-4) Example\\n\\nRequest\\n\\nCopy\\n\\n```\\nfrom tavily import TavilyClient\\n\\n# Step 1. Instantiating your TavilyClient\\ntavily_client = TavilyClient(api_key=\\\"tvly-YOUR_API_KEY\\\")\\n\\n# Step 2. Defining the starting URL of the mapping\\nurl = \\\"https://docs.tavily.com\\\"\\n\\n# Step 3. Executing the mapping with some guidance parameters\\nresponse = tavily_client.mapping(url, query=\\\"JavaScript\\\")\\n\\n# Step 4. Printing the results\\nprint(response)\\n\\n```\\n\\nResponse\\n\\nCopy\\n\\n```\\n{\\n    'base_url': 'https://docs.tavily.com',\\n    'results': [\\n      'https://docs.tavily.com/sdk/javascript/quick-start',\\n      'https://docs.tavily.com/sdk/javascript/reference',\\n    ],\\n    'response_time': 8.43\\n}\\n\\n```\\n\\n## [\\u200b](#tavily-hybrid-rag) Tavily Hybrid RAG\\n\\nTavily Hybrid RAG is an extension of the Tavily Search API built to retrieve relevant data from both the web and an existing database collection. This way, a RAG agent can combine web sources and locally available data to perform its tasks. Additionally, data queried from the web that is not yet in the database can optionally be inserted into it. This will allow similar searches in the future to be answered faster, without the need to query the web again.\\n\\n### [\\u200b](#parameters-5) Parameters\\n\\nThe TavilyHybridClient class is your gateway to Tavily Hybrid RAG. There are a few important parameters to keep in mind when you are instantiating a Tavily Hybrid Client.\\n\\n| Parameter | Type | Description | Default |\\n| --- | --- | --- | --- |\\n| `api_key` | `str` | Your Tavily API Key |  |\\n| `db_provider` | `str` | Your database provider. Currently, only `\\\"mongodb\\\"` is supported. |  |\\n| `collection` | `str` | A reference to the MongoDB collection that will be used for local search. |  |\\n| `embeddings_field` (optional) | `str` | The name of the field that stores the embeddings in the specified collection. This field MUST be the same one used in the specified index. This will also be used when inserting web search results in the database using our default function. | `\\\"embeddings\\\"` |\\n| `content_field` (optional) | `str` | The name of the field that stores the text content in the specified collection. This will also be used when inserting web search results in the database using our default function. | `\\\"content\\\"` |\\n| `embedding_function` (optional) | `function` | A custom embedding function (if you want to use one). The function must take in a `list[str]` corresponding to the list of strings to be embedded, as well as an additional string defining the type of document. It must return a `list[list[float]]`, one embedding per input string. If no function is provided, defaults to Cohere\\u2019s Embed. Keep in mind that you shouldn\\u2019t mix different embeddings in the same database collection. |  |\\n| `ranking_function` (optional) | `function` | A custom ranking function (if you want to use one). If no function is provided, defaults to Cohere\\u2019s Rerank. It should return an ordered `list[dict]` where the documents are sorted by decreasing relevancy to your query. Each returned document will have two properties - `content`, which is a `str`, and `score`, which is a `float`. The function MUST accept the following parameters: `query`: `str` - This is the query you are executing. When your ranking function is called during Hybrid RAG, the query parameter of your search call (more details below) will be passed as query. `documents`:`List[Dict]`: - This is the list of documents that are returned by your Hybrid RAG call and that you want to sort. Each document will have two properties - `content`, which is a `str`, and `score`, which is a `float`. `top_n`: `int` - This is the number of results you want to return after ranking. When your ranking function is called during Hybrid RAG, the max\\\\_results value will be passed as `top_n`. |  |\\n\\n### [\\u200b](#methods) Methods\\n\\n`search`(query, max\\\\_results=10, max\\\\_local=None, max\\\\_foreign=None, save\\\\_foreign=False, \\\\*\\\\*kwargs)\\n\\nPerforms a Tavily Hybrid RAG query and returns the retrieved documents as a `list[dict]` where the documents are sorted by decreasing relevancy to your query. Each returned document will have three properties - `content` (str), `score` (float), and `origin`, which is either `local` or `foreign`.\\n\\n| Parameter | Type | Description | Default |  |\\n| --- | --- | --- | --- | --- |\\n| `query` | `str` | The query you want to search for. |  |  |\\n| `max_results` | `int` | The maximum number of total search results to return. | 10 |  |\\n| `max_local` | `int` | The maximum number of local search results to return. | `None`, which defaults to `max_results`. |  |\\n| `max_local` | `int` | The maximum number of local search results to return. | `None`, which defaults to `max_results`. |  |\\n| `max_foreign` | `int` | The maximum number of web search results to return. | `None`, which defaults to `max_results`. |  |\\n| `save_foreign` | `Union[bool, function]` | Save documents from the web search in the local database. If `True` is passed, our default saving function (which only saves the content `str` and the embedding `list[float]` will be used.) If `False` is passed, no web search result documents will be saved in the local database. If a function is passed, that function MUST take in a `dict` as a parameter, and return another `dict`. The input `dict` contains all properties of the returned Tavily result object. The output dict is the final document that will be inserted in the database. You are free to add to it any fields that are supported by the database, as well as remove any of the default ones. If this function returns `None`, the document will not be saved in the database. |  |  |\\n\\nAdditional parameters can be provided as keyword arguments (detailed below). The keyword arguments supported by this method are: `search_depth`, `topic`, `include_raw_content`, `include_domains`,`exclude_domains`.\\n\\n### [\\u200b](#setup) Setup\\n\\n#### [\\u200b](#mongodb-setup) MongoDB setup\\n\\nYou will need to have a MongoDB collection with a vector search index. You can follow the [MongoDB Documentation](https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/) to learn how to set this up.\\n\\n#### [\\u200b](#cohere-api-key) Cohere API Key\\n\\nBy default, embedding and ranking use the Cohere API, our recommended option. Unless you want to provide a custom embedding and ranking function, you\\u2019ll need to get an API key from [Cohere](https://cohere.com/) and set it as an environment variable named `CO_API_KEY`\\n\\nIf you decide to stick with Cohere, please note that you\\u2019ll need to install the Cohere Python package as well:\\n\\nCopy\\n\\n```\\npip install cohere\\n\\n```\\n\\n#### [\\u200b](#tavily-hybrid-rag-client-setup) Tavily Hybrid RAG Client setup\\n\\nOnce you are done setting up your database, you\\u2019ll need to create a MongoDB Client as well as a Tavily Hybrid RAG Client.\\nA minimal setup would look like this:\\n\\nCopy\\n\\n```\\nfrom pymongo import MongoClient\\nfrom tavily import TavilyHybridClient\\n\\ndb = MongoClient(\\\"mongodb+srv://YOUR_MONGO_URI\\\")[\\\"YOUR_DB\\\"]\\n\\nhybrid_rag = TavilyHybridClient(\\n    api_key=\\\"tvly-YOUR_API_KEY\\\",\\n    db_provider=\\\"mongodb\\\",\\n    collection=db.get_collection(\\\"YOUR_COLLECTION\\\"),\\n    index=\\\"YOUR_VECTOR_SEARCH_INDEX\\\",\\n    embeddings_field=\\\"YOUR_EMBEDDINGS_FIELD\\\",\\n    content_field=\\\"YOUR_CONTENT_FIELD\\\"\\n)\\n\\n```\\n\\n### [\\u200b](#usage) Usage\\n\\nOnce you create the proper clients, you can easily start searching. A few simple examples are shown below. They assume you\\u2019ve followed earlier steps. You can use most of the Tavily Search parameters with Tavily Hybrid RAG as well.\\n\\n#### [\\u200b](#simple-tavily-hybrid-rag-example) Simple Tavily Hybrid RAG example\\n\\nThis example will look for context about Leo Messi on the web and in the local database.\\nHere, we get 5 sources, both from our database and from the web, but we want to exclude unwanted-domain.com from our web search results:\\n\\nCopy\\n\\n```\\nresults = hybrid_rag.search(\\\"Who is Leo Messi?\\\", max_results=5, exclude_domains=['unwanted-domain.com'])\\n\\n```\\n\\nHere, we want to prioritize the number of local sources, so we will get 2 foreign (web) sources, and 5 sources from our database:\\n\\nCopy\\n\\n```\\nresults = hybrid_rag.search(\\\"Who is Leo Messi?\\\",  max_local=5, max_foreign=2)\\n\\n```\\n\\nNote: The sum of `max_local` and `max_foreign` can exceed `max_results`, but only the top `max_results` results will be returned.\\n\\n#### [\\u200b](#adding-retrieved-data-to-the-database) Adding retrieved data to the database\\n\\nIf you want to add the retrieved data to the database, you can do so by setting the save\\\\_foreign parameter to True:\\n\\nCopy\\n\\n```\\nresults = hybrid_rag.search(\\\"Who is Leo Messi?\\\", save_foreign=True)\\n\\n```\\n\\nThis will use our default saving function, which stores the content and its embedding.\\n\\n### [\\u200b](#examples) Examples\\n\\n#### [\\u200b](#sample-1%3A-using-a-custom-saving-function) Sample 1: Using a custom saving function\\n\\nYou might want to add some extra properties to documents you\\u2019re inserting or even discard some of them based on custom criteria. This can be done by passing a function to the save\\\\_foreign parameter:\\n\\nCopy\\n\\n```\\ndef save_document(document):\\n    if document['score'] < 0.5:\\n        return None # Do not save documents with low scores\\n\\n    return {\\n        'content': document['content'],\\n\\n         # Save the title and URL in the database\\n        'site_title': document['title'],\\n        'site_url': document['url'],\\n\\n        # Add a new field\\n        'added_at': datetime.now()\\n    }\\n\\nresults = hybrid_rag.search(\\\"Who is Leo Messi?\\\", save_foreign=save_document)\\n\\n```\\n\\n#### [\\u200b](#sample-2%3A-using-a-custom-embedding-function) Sample 2: Using a custom embedding function\\n\\nBy default, we use [Cohere](https://cohere.com/) for our embeddings. If you want to use your own embeddings, can pass a custom embedding function to the TavilyHybridClient:\\n\\nCopy\\n\\n```\\ndef my_embedding_function(texts, doc_type): # doc_type will be either 'search_query' or 'search_document'\\n    return my_embedding_model.encode(texts)\\n\\nhybrid_rag = TavilyHybridClient(\\n    # ...\\n    embedding_function=my_embedding_function\\n)\\n\\n```\\n\\n#### [\\u200b](#sample-3%3A-using-a-custom-ranking-function) Sample 3: Using a custom ranking function\\n\\nCohere\\u2019s [rerank](https://cohere.com/rerank) model is used by default, but you can pass your own function to the ranking\\\\_function parameter:\\n\\nCopy\\n\\n```\\ndef my_ranking_function(query, documents, top_n):\\n    return my_ranking_model.rank(query, documents, top_n)\\n\\nhybrid_rag = TavilyHybridClient(\\n    # ...\\n    ranking_function=my_ranking_function\\n)\\n\\n```\\n\\n[Quickstart](/sdk/python/quick-start)[Quickstart](/sdk/javascript/quick-start)\\n\\n[x](https://x.com/tavilyai)[github](https://github.com/tavily-ai)[linkedin](https://linkedin.com/company/tavily)[website](https://tavily.com)\\n\\n[Powered by Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.tavily.com)\\n\\nOn this page\\n\\n- [Instantiating a client](#instantiating-a-client)\\n- [Synchronous Client](#synchronous-client)\\n- [Asynchronous Client](#asynchronous-client)\\n- [Proxies](#proxies)\\n- [Tavily Search](#tavily-search)\\n- [Parameters](#parameters)\\n- [Response format](#response-format)\\n- [Results](#results)\\n- [Image Results](#image-results)\\n- [Example](#example)\\n- [Tavily Extract](#tavily-extract)\\n- [Parameters](#parameters-2)\\n- [Response format](#response-format-2)\\n- [Successful Results](#successful-results)\\n- [Failed Results](#failed-results)\\n- [Example](#example-2)\\n- [Tavily Crawl](#tavily-crawl)\\n- [Parameters](#parameters-3)\\n- [Response format](#response-format-3)\\n- [Results](#results-2)\\n- [Example](#example-3)\\n- [Tavily Map](#tavily-map)\\n- [Parameters](#parameters-4)\\n- [Response format](#response-format-4)\\n- [Example](#example-4)\\n- [Tavily Hybrid RAG](#tavily-hybrid-rag)\\n- [Parameters](#parameters-5)\\n- [Methods](#methods)\\n- [Setup](#setup)\\n- [MongoDB setup](#mongodb-setup)\\n- [Cohere API Key](#cohere-api-key)\\n- [Tavily Hybrid RAG Client setup](#tavily-hybrid-rag-client-setup)\\n- [Usage](#usage)\\n- [Simple Tavily Hybrid RAG example](#simple-tavily-hybrid-rag-example)\\n- [Adding retrieved data to the database](#adding-retrieved-data-to-the-database)\\n- [Examples](#examples)\\n- [Sample 1: Using a custom saving function](#sample-1%3A-using-a-custom-saving-function)\\n- [Sample 2: Using a custom embedding function](#sample-2%3A-using-a-custom-embedding-function)\\n- [Sample 3: Using a custom ranking function](#sample-3%3A-using-a-custom-ranking-function)\",\n            \"images\": []\n        },\n        {\n            \"url\": \"https://docs.tavily.com/sdk/python/quick-start\",\n            \"raw_content\": \"Quickstart - Tavily Docs\\n\\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\\n\\nSearch or ask...\\n\\nCtrl K\\n\\n- [Support](mailto:support@tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n- [Get an API key](https://app.tavily.com)\\n\\nSearch...\\n\\nNavigation\\n\\nPython\\n\\nQuickstart\\n\\n[Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)\n\n- [API Playground](https://app.tavily.com/playground)\n- [Community](https://community.tavily.com)\n- [Blog](https://blog.tavily.com)\n\n##### Python\n\n- [Quickstart](/sdk/python/quick-start)\n- [SDK Reference](/sdk/python/reference)\n\n##### JavaScript\n\n- [Quickstart](/sdk/javascript/quick-start)\n- [SDK Reference](/sdk/javascript/reference)\n\nPython\n\n# Quickstart\n\nIntegrate Tavily's powerful APIs natively in your Python apps.\n\nLooking for the Python SDK Reference? Head to our [Python SDK Reference](/sdk/python/reference) and learn how to use `tavily-python`.\n\n## [](#introduction) Introduction\n\nThe Python SDK allows for easy interaction with the Tavily API, offering the full range of our search functionality directly from your Python programs. Easily integrate smart search capabilities into your applications, harnessing Tavily's powerful search features.\n\n[## GitHub\n\n`/tavily-ai/tavily-python`\n\n![GitHub Repo stars](https://img.shields.io/github/stars/tavily-ai/tavily-python?style=social)](https://github.com/tavily-ai/tavily-python)[## PyPI\n\n`tavily-python`\n\n![PyPI downloads](https://img.shields.io/pypi/dm/tavily-python)](https://pypi.org/project/tavily-python)\n\n## [](#quickstart) Quickstart\n\nGet started with our Python SDK in less than 5 minutes!\n\n[## Get your free API key\n\nYou get 1,000 free API Credits every month. **No credit card required.**](https://app.tavily.com)\n\n### [](#installation) Installation\n\nYou can install the Tavily Python SDK using the following:\n\nCopy\n\n```\npip install tavily-python\n\n```\n\n### [](#usage) Usage\n\nWith Tavily's Python SDK, you can search the web in only 4 lines of code:\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\ntavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")\nresponse = tavily_client.search("Who is Leo Messi?")\n\nprint(response)\n\n```\n\nYou can also easily extract content from URLs:\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\ntavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")\nresponse = tavily_client.extract("https://en.wikipedia.org/wiki/Lionel_Messi")\n\nprint(response)\n\n```\n\nTavily also allows you to perform a smart crawl starting at a given URL.\n\nCopy\n\n```\nfrom tavily import TavilyClient\n\ntavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")\nresponse = tavily_client.crawl("https://docs.tavily.com", query="Python SDK")\n\nprint(response)\n\n```\n\nThese examples are very simple, and you can do so much more with Tavily!\n\n## [](#features) Features\n\nOur Python SDK supports the full feature range of our [REST API](/api-reference), and more. We offer both a synchronous and an asynchronous client, for increased flexibility.\n\n- The `search` function lets you harness the full power of Tavily Search.\n- The `extract` function allows you to easily retrieve web content with Tavily Extract.\n\nFor more details, head to the [Python SDK Reference](/sdk/python/reference).\n\n[SDK Reference](/sdk/python/reference)\n\n[x](https://x.com/tavilyai)[github](https://github.com/tavily-ai)[linkedin](https://linkedin.com/company/tavily)[website](https://tavily.com)\n\n[Powered by Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.tavily.com)\n\nOn this page\n\n- [Introduction](#introduction)\n- [Quickstart](#quickstart)\n- [Installation](#installation)\n- [Usage](#usage)\n- [Features](#features)",
>       images: [],
>       "favicon": "https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3"
>     },
>     {
>       "url": "https://docs.tavily.com/docs/python-sdk/tavily-search/getting-started",
>       "raw_content": "Welcome - Tavily Docs\n\n[Tavily Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)\n\nSearch or ask...\n\nCtrl K\n\n- [Support](mailto:support@tavily.com)\n- [Get an API key](https://app.tavily.com)\n- [Get an API key](https://app.tavily.com)\n\nSearch...\n\nNavigation\n\n[Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)\n\nExplore our docs\n\nYour journey to state-of-the-art web search starts right here.\n\n[## Quickstart\n\nStart searching with Tavily in minutes](documentation/quickstart)[## API Reference\n\nStart using Tavily's powerful APIs](documentation/api-reference/endpoint/search)[## API Credits Overview\n\nLearn how to get and manage your Tavily API Credits](documentation/api-credits)[## Rate Limits\n\nLearn about Tavily's API rate limits for both development and production environments](documentation/rate-limits)[## Python\n\nGet started with our Python SDK, `tavily-python`](sdk/python/quick-start)[## Playground\n\nExplore Tavily's APIs with our interactive playground](https://app.tavily.com/playground)",
>       "images": [],
>       "favicon: "https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3",
>   requestId: "123e4567-e89b-12d3-a456-426614174111"
>
>     }
>   ]
> }
> ````

## Tavily Map

You can access Tavily Map in JavaScript through the client's `map` function.

### Parameters

| Parameter | Type | Description | Default |
| :- | :- | :- | :- |
| `url` **(required)** | `string` | The root URL to begin the mapping. | — |
| `maxDepth` | `number` | Max depth of the mapping. Defines how far from the base URL the crawler can explore. | `1` |
| `maxBreadth` | `number` | Max number of links to follow **per level** of the tree (i.e., per page). | `20` |
| `limit` | `number` | Total number of links the crawler will process before stopping. | `50` |
| `instructions` | `string` | Natural language instructions for the mapper. | — |
| `selectPaths` | `string[]` | **Regex patterns** to select only URLs with specific path patterns (e.g., `"/docs/.*"`, `"/api/v1.*"`). | `[]` |
| `selectDomains` | `string[]` | **Regex patterns** to select crawling to specific domains or subdomains (e.g., `"^docs\.example\.com$"`). | `[]` |
| `excludePaths` | `string[]` | **Regex patterns** to exclude URLs with specific path patterns (e.g., `"/admin/.*"`, `"/private/.*"`). | `[]` |
| `excludeDomains` | `string[]` | **Regex patterns** to exclude specific domains or subdomains from mapping (e.g., `"^admin\.example\.com$"`). | `[]` |
| `allowExternal` | `boolean` | Whether to return links from external domains in crawl output. | `true` |
| `timeout` | `number` | Maximum time in seconds to wait for the map operation before timing out. Must be between 10 and 150 seconds. | `150` |
| `includeUsage` | `boolean` | Whether to include credit usage information in the response.`NOTE:`The value may be 0 if the total successful pages mapped has not yet reached 10 calls. See our [Credits & Pricing documentation](https://docs.tavily.com/documentation/api-credits.md) for details. | `false` |

### Response format

The response object you receive will be in the following format:

| Key | Type | Description |
| :- | :- | :- |
| `baseUrl` | `string` | The URL you started the crawl from. |
| `results` | `string[]` | A list of URLs that were discovered during the mapping. |
| `responseTime` | `number` | The crawl response time. |
| `requestId` | `string` | A unique request identifier you can share with customer support to help resolve issues with specific requests. |

### Example

> [accordion] Request
>
> ```javascript theme={null}
> const { tavily } = require("@tavily/core");
>
> // Step 1. Instantiating your Tavily client
> const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
>
> // Step 2. Defining the starting URL of the mapping
> const url = "https://docs.tavily.com";
>
> // Step 3. Executing the mapping with some guidance parameters
> const response = await client.map(url, { instructions: "Find all pages on the Python SDK" });
>
> // Step 4. Printing the results
> console.log(response);
> ```

> [accordion] Response
>
> ```javascript theme={null}
> {
>     baseUrl: 'https://docs.tavily.com',
>     results:[
>       'https://docs.tavily.com/sdk/python/reference',
>       'https://docs.tavily.com/sdk/python/quick-start',
>       'https://docs.tavily.com/docs/python-sdk/tavily-search/getting-started'
>     ],
>     responseTime: 8.43
>     requestId: "123e4567-e89b-12d3-a456-426614174111"
> }
> ```

## Error handling

When the API rejects a request, the client rejects with an error that carries the HTTP status code and the parsed response body, so you can branch on the status instead of parsing the message text. Requires `@tavily/core` 1.1.0 or later.

| Error | Thrown when | Fields |
| :- | :- | :- |
| `TavilyRequestError` | The API returns any non-2xx response. | `status`, `body` |
| `TavilyKeylessLimitError` | A request made without an API key hits its limit. Extends `TavilyRequestError`. | `status`, `body`, `capType`, `window`, `retryAfter`, `continuationPaths` |

| Field | Type | Description |
| :- | :- | :- |
| `status` | `number` | The HTTP status code of the response. |
| `body` | `unknown` | The parsed response body, or the raw text when the body is not JSON. |
| `capType` | `string` | The limit that was hit, as the API names it (for example `hourly_cap_reached`). |
| `window` | `string \| null` | The limit window (for example `"hour"`), or `null` when the API does not send one. |
| `retryAfter` | `number \| null` | Seconds until the limit resets, or `null` when the API does not send one. |
| `continuationPaths` | `TavilyContinuationPath[]` | Ways to continue, such as signing up for an API key. Each has a `type` and may carry a `resource`. |

```javascript theme={null}
const { tavily, TavilyRequestError, TavilyKeylessLimitError } = require("@tavily/core");

const client = tavily({ apiKey: "tvly-YOUR_API_KEY" });

try {
  const response = await client.search("Who is Leo Messi?");
  console.log(response);
} catch (error) {
  if (error instanceof TavilyKeylessLimitError) {
    console.log(`Keyless limit hit (${error.capType}); retry in ${error.retryAfter}s`);
  } else if (error instanceof TavilyRequestError && error.status === 429) {
    console.log("Rate limited, backing off");
  } else if (error instanceof TavilyRequestError) {
    console.log(error.status, error.body);
  } else {
    throw error;
  }
}
```

## Raw API access

`createTransport` returns an authenticated transport that calls any endpoint and resolves with the response body exactly as the API sends it, with `snake_case` field names unchanged. It takes the same options as `tavily()`, including `apiKey`, `proxies`, and `projectId`, and throws the same errors. Use it when you need an endpoint or a field the typed client does not expose yet.

```javascript theme={null}
const { createTransport } = require("@tavily/core");

const transport = createTransport({ apiKey: "tvly-YOUR_API_KEY" });

const response = await transport.post("search", {
  query: "Who is Leo Messi?",
  max_results: 3,
});

console.log(response.results);
```

| Method | Description |
| :- | :- |
| `post(endpoint, body, options?)` | Sends a JSON `POST` to the endpoint, for example `"search"` or `"extract"`. |
| `get(endpoint, options?)` | Sends a `GET` to the endpoint. `options.params` adds query parameters. |
| `stream(endpoint, body, options?)` | Sends a `POST` and resolves with an async iterator of response chunks. |

`options` accepts `timeoutSeconds` and `headers` to override the request timeout or add headers to a single call.


> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tavily Search

> Execute a search query using Tavily Search.



## OpenAPI

````yaml POST /search
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /search:
    post:
      summary: Search for data based on a query
      description: Execute a search query using Tavily Search.
      operationId: search
      requestBody:
        description: Parameters for the Tavily Search request.
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                query:
                  type: string
                  description: The search query to execute with Tavily.
                  example: who is Leo Messi?
                search_depth:
                  type: string
                  description: >-
                    Controls the latency vs. relevance tradeoff and how
                    `results[].content` is generated:

                    - `advanced`: Highest relevance with increased latency. Best
                    for detailed, high-precision queries. Returns multiple
                    semantically relevant snippets per URL (configurable via
                    `chunks_per_source`).

                    - `basic`: A balanced option for relevance and latency.
                    Ideal for general-purpose searches. Returns multiple
                    semantically relevant snippets per URL (configurable via
                    `chunks_per_source`).

                    - `fast`: Prioritizes lower latency while maintaining good
                    relevance. Returns multiple semantically relevant snippets
                    per URL (configurable via `chunks_per_source`).

                    - `ultra-fast`: Minimizes latency above all else. Best for
                    time-critical use cases. Returns one NLP summary per URL.


                    **Cost**:

                    - `basic`, `fast`, `ultra-fast`: 1 API Credit

                    - `advanced`: 2 API Credits


                    See [Search Best
                    Practices](/documentation/best-practices/best-practices-search#search-depth)
                    for guidance on choosing the right search depth.
                  enum:
                    - advanced
                    - basic
                    - fast
                    - ultra-fast
                  default: basic
                chunks_per_source:
                  type: integer
                  description: >-
                    Chunks are short content snippets (about 500 characters each
                    for `basic` and `fast`, 800 for `advanced`) pulled directly
                    from the source. Use `chunks_per_source` to define the
                    maximum number of relevant chunks returned per source and to
                    control the `content` length. Chunks will appear in the
                    `content` field as: `<chunk 1> [...] <chunk 2> [...] <chunk
                    3>`. Adjacent chunks may be joined into one longer passage,
                    so chunk length is a target, not a hard limit. Available
                    when `search_depth` is `advanced`, `basic` or `fast`.
                  default: 3
                  minimum: 1
                  maximum: 3
                max_results:
                  type: integer
                  example: 1
                  description: The maximum number of search results to return.
                  default: 10
                  minimum: 0
                  maximum: 20
                topic:
                  type: string
                  description: >-
                    The category of the search.`news` is useful for retrieving
                    real-time updates, particularly about politics, sports, and
                    major current events covered by mainstream media sources.
                    `general` is for broader, more general-purpose searches that
                    may include a wide range of sources.
                  default: general
                  enum:
                    - general
                    - news
                    - finance
                time_range:
                  type: string
                  description: >-
                    The time range back from the current date to filter results
                    by publish date. Continuously updated pages, such as weather
                    forecasts and prices, keep old publish dates and get
                    filtered out. For those, leave `time_range` unset and use
                    `max_age_hours`. By default, results with no detectable
                    published date are not removed; set
                    `filter_by_published_date` to `true` to remove them.
                  enum:
                    - day
                    - week
                    - month
                    - year
                    - d
                    - w
                    - m
                    - 'y'
                  default: null
                start_date:
                  type: string
                  description: >-
                    Will return all results after the specified start date based
                    on publish date. Required to be written in the format
                    YYYY-MM-DD. By default, results with no detectable published
                    date are not removed; set `filter_by_published_date` to
                    `true` to remove them.
                  example: '2025-02-09'
                  default: null
                end_date:
                  type: string
                  description: >-
                    Will return all results before the specified end date based
                    on publish date. Required to be written in the format
                    YYYY-MM-DD. By default, results with no detectable published
                    date are not removed; set `filter_by_published_date` to
                    `true` to remove them.
                  example: '2025-12-29'
                  default: null
                include_published_date:
                  type: boolean
                  description: >-
                    Include a `published_date` field in each result. The date is
                    Tavily's best estimate of when the source was published or
                    last updated, so it can be later than the original publish
                    date. Results with no detectable date return `null`.
                    Automatically enabled when `topic` is `news`.


                    **Note**: this feature is currently in beta.
                  default: false
                filter_by_published_date:
                  type: boolean
                  description: >-
                    Remove results whose published date falls outside the
                    `time_range`, `start_date`, or `end_date` window. Results
                    with no detectable published date are also removed. Setting
                    this to `true` also enables `include_published_date`.


                    If you want date-window filtering but don't want to lose
                    sources without a detectable date, leave this `false` and
                    set `include_published_date: true` together with a date
                    range instead.
                  default: false
                max_age_hours:
                  type: integer
                  description: >-
                    The maximum age in hours of Tavily's cached copy of each
                    result.


                    Accepted values:


                    - unset (default): Tavily serves cached copies and fetches
                    pages live as needed.

                    - `1` to `720` (30 days): only return a cached copy fetched
                    within that many hours.

                    - `0`: always fetch the page live.

                    - `-1`: never fetch live.


                    Use this for continuously updated pages, such as weather
                    forecasts and prices, where `time_range` drops results. You
                    can combine the two.


                    Lower values do not cost more credits, but fetching live
                    adds latency. Results whose cached copy is too old and can't
                    be fetched live are left out, so you may get fewer than
                    `max_results`.


                    On non-paying plans, live fetching is best-effort. While
                    Tavily is under heavy load, requests that set
                    `max_age_hours` may be refused with `434 Flex tier capacity
                    exceeded`.
                  minimum: -1
                  maximum: 720
                  example: 24
                  default: null
                include_answer:
                  oneOf:
                    - type: boolean
                    - type: string
                      enum:
                        - basic
                        - advanced
                  description: >-
                    Include an LLM-generated answer to the provided query.
                    `basic` or `true` returns a quick answer. `advanced` returns
                    a more detailed answer.
                  default: false
                include_raw_content:
                  oneOf:
                    - type: boolean
                    - type: string
                      enum:
                        - markdown
                        - text
                  description: >-
                    Include the cleaned and parsed HTML content of each search
                    result. `markdown` or `true` returns search result content
                    in markdown format. `text` returns the plain text from the
                    results and may increase latency.
                  default: false
                include_images:
                  type: boolean
                  description: >-
                    Include images in the response. Returns both a top-level
                    `images` list of query-related images and an `images` array
                    inside each result object with images extracted from that
                    specific source.
                  default: false
                include_image_descriptions:
                  type: boolean
                  description: >-
                    When `include_images` is `true`, also add a descriptive text
                    for each image.
                  default: false
                include_favicon:
                  type: boolean
                  description: Whether to include the favicon URL for each result.
                  default: false
                include_domains:
                  type: array
                  description: >-
                    A list of domains to specifically include in the search
                    results. Maximum 300 domains.
                  items:
                    type: string
                  default: []
                exclude_domains:
                  type: array
                  description: >-
                    A list of domains to specifically exclude from the search
                    results. Maximum 150 domains.
                  items:
                    type: string
                  default: []
                include_domains_mode:
                  type: string
                  description: >-
                    Controls how `include_domains` is applied. `restrict` limits
                    results to only the listed domains. `prefer` also searches
                    the rest of the web, so results outside `include_domains`
                    can still surface, rather than excluding them. Defaults to
                    `restrict`, so `include_domains` acts as a hard filter
                    unless set to `prefer`. Setting it without `include_domains`
                    returns a 400 error.
                  enum:
                    - restrict
                    - prefer
                  default: restrict
                country:
                  type: string
                  description: >-
                    Boost search results from a specific country. This will
                    prioritize content from the selected country in the search
                    results. Available only if topic is `general`.
                  enum:
                    - afghanistan
                    - albania
                    - algeria
                    - andorra
                    - angola
                    - argentina
                    - armenia
                    - australia
                    - austria
                    - azerbaijan
                    - bahamas
                    - bahrain
                    - bangladesh
                    - barbados
                    - belarus
                    - belgium
                    - belize
                    - benin
                    - bhutan
                    - bolivia
                    - bosnia and herzegovina
                    - botswana
                    - brazil
                    - brunei
                    - bulgaria
                    - burkina faso
                    - burundi
                    - cambodia
                    - cameroon
                    - canada
                    - cape verde
                    - central african republic
                    - chad
                    - chile
                    - china
                    - colombia
                    - comoros
                    - congo
                    - costa rica
                    - croatia
                    - cuba
                    - cyprus
                    - czech republic
                    - denmark
                    - djibouti
                    - dominican republic
                    - ecuador
                    - egypt
                    - el salvador
                    - equatorial guinea
                    - eritrea
                    - estonia
                    - ethiopia
                    - fiji
                    - finland
                    - france
                    - gabon
                    - gambia
                    - georgia
                    - germany
                    - ghana
                    - greece
                    - guatemala
                    - guinea
                    - haiti
                    - honduras
                    - hungary
                    - iceland
                    - india
                    - indonesia
                    - iran
                    - iraq
                    - ireland
                    - israel
                    - italy
                    - jamaica
                    - japan
                    - jordan
                    - kazakhstan
                    - kenya
                    - kuwait
                    - kyrgyzstan
                    - latvia
                    - lebanon
                    - lesotho
                    - liberia
                    - libya
                    - liechtenstein
                    - lithuania
                    - luxembourg
                    - madagascar
                    - malawi
                    - malaysia
                    - maldives
                    - mali
                    - malta
                    - mauritania
                    - mauritius
                    - mexico
                    - moldova
                    - monaco
                    - mongolia
                    - montenegro
                    - morocco
                    - mozambique
                    - myanmar
                    - namibia
                    - nepal
                    - netherlands
                    - new zealand
                    - nicaragua
                    - niger
                    - nigeria
                    - north korea
                    - north macedonia
                    - norway
                    - oman
                    - pakistan
                    - panama
                    - papua new guinea
                    - paraguay
                    - peru
                    - philippines
                    - poland
                    - portugal
                    - qatar
                    - romania
                    - russia
                    - rwanda
                    - saudi arabia
                    - senegal
                    - serbia
                    - singapore
                    - slovakia
                    - slovenia
                    - somalia
                    - south africa
                    - south korea
                    - south sudan
                    - spain
                    - sri lanka
                    - sudan
                    - sweden
                    - switzerland
                    - syria
                    - taiwan
                    - tajikistan
                    - tanzania
                    - thailand
                    - togo
                    - trinidad and tobago
                    - tunisia
                    - turkey
                    - turkmenistan
                    - uganda
                    - ukraine
                    - united arab emirates
                    - united kingdom
                    - united states
                    - uruguay
                    - uzbekistan
                    - venezuela
                    - vietnam
                    - yemen
                    - zambia
                    - zimbabwe
                  default: null
                language:
                  type: string
                  description: >-
                    Boost search results in a specific language. Accepts an ISO
                    639-1 code (e.g. `en`, `fr`, `zh-cn`) or an English language
                    name (e.g. `english`, `french`). By default this only boosts
                    matching-language results in ranking; pass
                    `filter_by_language: true` to strictly filter out
                    non-matching results instead. For best results, write your
                    `query` in the same language you set here.
                  example: en
                  default: null
                filter_by_language:
                  type: boolean
                  description: >-
                    Strictly filter out search results that don't match the
                    `language` parameter, instead of only boosting them in
                    ranking. Requires `language` to be set; returns a 400 error
                    otherwise.
                  default: false
                auto_parameters:
                  type: boolean
                  description: >-
                    When `auto_parameters` is enabled, Tavily automatically
                    configures search parameters based on your query's content
                    and intent. You can still set other parameters manually, and
                    your explicit values will override the automatic ones. The
                    parameters `include_answer`, `include_raw_content`, and
                    `max_results` must always be set manually, as they directly
                    affect response size. Note: `search_depth` may be
                    automatically set to advanced when it's likely to improve
                    results. This uses 2 API credits per request. To avoid the
                    extra cost, you can explicitly set `search_depth` to
                    `basic`.
                  default: false
                exact_match:
                  type: boolean
                  description: >-
                    Ensure that only search results containing the exact quoted
                    phrase(s) in the query are returned, bypassing synonyms or
                    semantic variations. Wrap target phrases in quotes within
                    your query (e.g. `"John Smith" CEO Acme Corp`). Punctuation
                    is typically ignored inside quotes.
                  default: false
                include_usage:
                  type: boolean
                  description: Whether to include credit usage information in the response.
                  default: false
                safe_search:
                  type: boolean
                  description: >-
                    Whether to filter out adult or unsafe content from results.
                    Not supported for `fast` or `ultra-fast` search depths.
                  default: false
              required:
                - query
      responses:
        '200':
          description: Search results returned successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  query:
                    type: string
                    description: The search query that was executed.
                    example: Who is Leo Messi?
                  answer:
                    type: string
                    description: >-
                      A short answer to the user's query, generated by an LLM.
                      Included in the response only if `include_answer` is
                      requested (i.e., set to `true`, `basic`, or `advanced`)
                    example: >-
                      Lionel Messi, born in 1987, is an Argentine footballer
                      widely regarded as one of the greatest players of his
                      generation. He spent the majority of his career playing
                      for FC Barcelona, where he won numerous domestic league
                      titles and UEFA Champions League titles. Messi is known
                      for his exceptional dribbling skills, vision, and
                      goal-scoring ability. He has won multiple FIFA Ballon d'Or
                      awards, numerous La Liga titles with Barcelona, and holds
                      the record for most goals scored in a calendar year. In
                      2014, he led Argentina to the World Cup final, and in
                      2015, he helped Barcelona capture another treble. Despite
                      turning 36 in June, Messi remains highly influential in
                      the sport.
                  images:
                    type: array
                    description: >-
                      A list of query-related images from image search. If
                      `include_image_descriptions` is true, each item will have
                      `url` and `description`. Note: per-result images are also
                      returned inside each result object's `images` field.
                    example: []
                    items:
                      type: object
                      properties:
                        url:
                          type: string
                        description:
                          type: string
                  results:
                    type: array
                    description: A list of sorted search results, ranked by relevancy.
                    items:
                      type: object
                      properties:
                        title:
                          type: string
                          description: The title of the search result.
                          example: Lionel Messi Facts | Britannica
                        url:
                          type: string
                          description: The URL of the search result.
                          example: https://www.britannica.com/facts/Lionel-Messi
                        content:
                          type: string
                          description: A short description of the search result.
                          example: >-
                            Lionel Messi, an Argentine footballer, is widely
                            regarded as one of the greatest football players of
                            his generation. Born in 1987, Messi spent the
                            majority of his career playing for Barcelona, where
                            he won numerous domestic league titles and UEFA
                            Champions League titles. Messi is known for his
                            exceptional dribbling skills, vision, and goal
                        score:
                          type: number
                          format: float
                          description: The relevance score of the search result.
                          example: 0.81025416
                        raw_content:
                          type: string
                          description: >-
                            The cleaned and parsed HTML content of the search
                            result. Only if `include_raw_content` is true.
                          example: null
                        published_date:
                          type: string
                          description: >-
                            Tavily's best estimate of when the source was
                            published or last updated. Can be later than the
                            original publish date. `null` if no date could be
                            detected. Only returned when
                            `include_published_date` is `true` (automatically
                            enabled when `topic` is `news`).
                          example: Tue, 11 Mar 2025 17:00:00 GMT
                        favicon:
                          type: string
                          description: The favicon URL for the result.
                          example: https://britannica.com/favicon.png
                        images:
                          type: array
                          description: >-
                            A list of images extracted from this search result.
                            Only included when `include_images` is `true`. If
                            `include_image_descriptions` is `true`, each item
                            will have `url` and `description`.
                          items:
                            type: object
                            properties:
                              url:
                                type: string
                              description:
                                type: string
                        id:
                          type: string
                          description: Unique identifier for this result
                          example: a3f9c2-04
                  auto_parameters:
                    type: object
                    description: >-
                      A dictionary of the selected auto_parameters, only shown
                      when `auto_parameters` is true.
                    example:
                      topic: general
                      search_depth: basic
                  response_time:
                    type: number
                    format: float
                    description: Time in seconds it took to complete the request.
                    example: '1.67'
                  usage:
                    type: object
                    description: Credit usage details for the request.
                    example:
                      credits: 1
                  request_id:
                    type: string
                    description: >-
                      A unique request identifier you can share with customer
                      support to help resolve issues with specific requests.
                    example: 123e4567-e89b-12d3-a456-426614174111
                required:
                  - query
                  - results
                  - images
                  - response_time
                  - answer
        '400':
          description: Bad Request - Your request is invalid.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    <400 Bad Request, (e.g Invalid topic. Must be 'general' or
                    'news'.)>
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '422':
          description: >-
            Request validation failed. The detail array identifies invalid
            fields.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ValidationError'
              example:
                detail:
                  - type: string_type
                    loc:
                      - body
                      - query
                    msg: Input should be a valid string
                    input: []
        '429':
          description: >-
            Too Many Requests. Error messages and retry delays can vary by
            rate-limit rule.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Your request has been blocked due to excessive requests.
                    Please reduce the rate of requests.
          headers:
            Retry-After:
              $ref: '#/components/headers/RetryAfter'
        '432':
          description: Key limit or Plan Limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    <432 Custom Forbidden Error (e.g This request exceeds your
                    plan's set usage limit. Please upgrade your plan or contact
                    support@tavily.com)>
        '433':
          description: PayGo limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds the pay-as-you-go limit. You can
                    increase your limit on the Tavily dashboard.
        '434':
          description: Flex tier capacity exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Live content fetching is temporarily unavailable on your
                    plan due to high demand. Retry shortly, or omit
                    max_age_hours/fetch_timeout to be served from cache.
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: Internal Server Error
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: |-
            from tavily import TavilyClient

            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
            response = tavily_client.search("Who is Leo Messi?")

            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: |-
            const { tavily } = require("@tavily/core");

            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
            const response = await tvly.search("Who is Leo Messi?");

            console.log(response);
components:
  schemas:
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
    ValidationError:
      type: object
      properties:
        detail:
          type: array
          items:
            type: object
            properties:
              loc:
                type: array
                items:
                  oneOf:
                    - type: string
                    - type: integer
              msg:
                type: string
              type:
                type: string
              input: {}
              ctx:
                type: object
  headers:
    RetryAfter:
      description: >-
        When present, the number of seconds to wait before retrying. Read the
        returned value; the delay can vary.
      schema:
        type: integer
        minimum: 0
      example: 60
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````


> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tavily Extract

> Extract content from one URL or batch up to 20 URLs in one request. Successful URLs appear in results; per-URL failures appear in failed_results. Check both arrays even when the response is HTTP 200. Request options apply to every URL in the batch.



## OpenAPI

````yaml POST /extract
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /extract:
    post:
      summary: Retrieve raw web content from specified URLs
      description: >-
        Extract content from one URL or batch up to 20 URLs in one request.
        Successful URLs appear in results; per-URL failures appear in
        failed_results. Check both arrays even when the response is HTTP 200.
        Request options apply to every URL in the batch.
      operationId: extract
      requestBody:
        description: Parameters for the Tavily Extract request.
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                urls:
                  oneOf:
                    - type: string
                      description: The URL to extract content from.
                      example: https://en.wikipedia.org/wiki/Artificial_intelligence
                    - type: array
                      items:
                        type: string
                      description: A list of 1–20 URLs to extract in one request.
                      example:
                        - https://en.wikipedia.org/wiki/Artificial_intelligence
                        - https://en.wikipedia.org/wiki/Machine_learning
                        - https://en.wikipedia.org/wiki/Data_science
                      minItems: 1
                      maxItems: 20
                query:
                  type: string
                  description: >-
                    User intent for reranking extracted content chunks. When
                    provided, chunks are reranked based on relevance to this
                    query.
                chunks_per_source:
                  type: integer
                  description: >-
                    Chunks are short content snippets (about 800 characters
                    each) pulled directly from the source. Use
                    `chunks_per_source` to define the maximum number of relevant
                    chunks returned per source and to control the `raw_content`
                    length. Chunks will appear in the `raw_content` field as:
                    `<chunk 1> [...] <chunk 2> [...] <chunk 3>`. If a page
                    splits into no more chunks than `chunks_per_source`, its
                    full content is returned. Available only when `query` is
                    provided. Must be between 1 and 5.
                  minimum: 1
                  maximum: 5
                  default: 3
                extract_depth:
                  type: string
                  description: >-
                    The depth of the extraction process. `advanced` extraction
                    retrieves more data, including tables and embedded content,
                    with higher success but may increase latency.`basic`
                    extraction costs 1 credit per 5 successful URL extractions,
                    while `advanced` extraction costs 2 credits per 5 successful
                    URL extractions.
                  enum:
                    - basic
                    - advanced
                  default: basic
                include_images:
                  type: boolean
                  description: >-
                    Include a list of images extracted from the URLs in the
                    response. Default is false.
                  default: false
                include_favicon:
                  type: boolean
                  description: Whether to include the favicon URL for each result.
                  default: false
                include_published_date:
                  type: boolean
                  description: >-
                    Include a `published_date` field in each result. The date is
                    Tavily's best estimate of when the source was published or
                    last updated, so it can be later than the original publish
                    date. Results with no detectable date return `null`.


                    **Note**: this feature is currently in beta.
                  default: false
                format:
                  type: string
                  description: >-
                    The format of the extracted web page content. `markdown`
                    returns content in markdown format. `text` returns plain
                    text and may increase latency.
                  enum:
                    - markdown
                    - text
                  default: markdown
                timeout:
                  type: number
                  format: float
                  description: >-
                    Maximum time in seconds to wait for the URL extraction
                    before timing out. Must be between 1.0 and 60.0 seconds. If
                    not specified, default timeouts are applied based on
                    extract_depth: 10 seconds for basic extraction and 30
                    seconds for advanced extraction.
                  minimum: 1
                  maximum: 60
                  default: None
                include_usage:
                  type: boolean
                  description: >-
                    Whether to include credit usage information in the response.
                    `NOTE:`The value may be 0 if the total successful URL
                    extractions has not yet reached 5 calls. See our [Credits &
                    Pricing
                    documentation](https://docs.tavily.com/documentation/api-credits)
                    for details.
                  default: false
              required:
                - urls
      responses:
        '200':
          description: >-
            Extraction completed. Check results and failed_results for each URL.
            HTTP 200 can have an empty results array when all valid URLs fail
            during extraction; output order is not guaranteed.
          content:
            application/json:
              schema:
                type: object
                properties:
                  results:
                    type: array
                    description: A list of extracted content from the provided URLs.
                    items:
                      type: object
                      properties:
                        url:
                          type: string
                          description: The URL from which the content was extracted.
                          example: >-
                            https://en.wikipedia.org/wiki/Artificial_intelligence
                        raw_content:
                          type: string
                          description: >-
                            The full content extracted from the page. When
                            `query` is provided, contains the top-ranked chunks
                            joined by `[...]` separator.
                          example: >-
                            "Jump to content\nMain
                            menu\nSearch\nAppearance\nDonate\nCreate
                            account\nLog in\nPersonal tools\n        Photograph
                            your local culture, help Wikipedia and win!\nToggle
                            the table of contents\nArtificial intelligence\n161
                            languages\nArticle\nTalk\nRead\nView source\nView
                            history\nTools\nFrom Wikipedia, the free
                            encyclopedia\n\"AI\" redirects here. For other uses,
                            see AI (disambiguation) and Artificial intelligence
                            (disambiguation).\nPart of a series on\nArtificial
                            intelligence (AI)\nshow\nMajor
                            goals\nshow\nApproaches\nshow\nApplications\nshow\nPhilosophy\nshow\nHistory\nshow\nGlossary\nvte\nArtificial
                            intelligence (AI), in its broadest sense, is
                            intelligence exhibited by machines, particularly
                            computer systems. It is a field of research in
                            computer science that develops and studies methods
                            and software that enable machines to perceive their
                            environment and use learning and intelligence to
                            take actions that maximize their chances of
                            achieving defined goals.[1] Such machines may be
                            called AIs.\nHigh-profile applications of AI include
                            advanced web search engines (e.g., Google Search);
                            recommendation systems (used by YouTube, Amazon, and
                            Netflix); virtual assistants (e.g., Google
                            Assistant, Siri, and Alexa); autonomous vehicles
                            (e.g., Waymo); generative and creative tools (e.g.,
                            ChatGPT and AI art); and superhuman play and
                            analysis in strategy games (e.g., chess and
                            Go)...................
                        images:
                          type: array
                          example: []
                          description: >-
                            This is only available if `include_images` is set to
                            `true`. A list of image URLs extracted from the
                            page.
                          items:
                            type: string
                        favicon:
                          type: string
                          description: The favicon URL for the result.
                          example: >-
                            https://en.wikipedia.org/static/favicon/wikipedia.ico
                        published_date:
                          type: string
                          nullable: true
                          description: >-
                            Tavily's best estimate of when the source was
                            published or last updated. Can be later than the
                            original publish date. `null` if no date could be
                            detected. Only returned when
                            `include_published_date` is `true`.
                          example: Thu, 18 Sep 2025 15:19:00 GMT
                  failed_results:
                    type: array
                    example: []
                    description: A list of URLs that could not be processed.
                    items:
                      type: object
                      properties:
                        url:
                          type: string
                          description: The URL that failed to be processed.
                        error:
                          type: string
                          description: >-
                            An error message describing why the URL couldn't be
                            processed.
                  response_time:
                    type: number
                    format: float
                    description: Time in seconds it took to complete the request.
                    example: 0.02
                  usage:
                    type: object
                    description: Credit usage details for the request.
                    example:
                      credits: 1
                  request_id:
                    type: string
                    description: >-
                      A unique request identifier you can share with customer
                      support to help resolve issues with specific requests.
                    example: 123e4567-e89b-12d3-a456-426614174111
              examples:
                partialSuccess:
                  summary: One URL succeeds and another fails
                  value:
                    results:
                      - url: https://example.com/article
                        raw_content: Example extracted article content.
                        images: []
                    failed_results:
                      - url: https://example.com/unavailable
                        error: Failed to retrieve content
                    response_time: 0.5
                    request_id: 123e4567-e89b-12d3-a456-426614174111
        '400':
          description: >-
            Bad Request. More than 20 URLs, an empty URL list, or no URLs
            passing validation are rejected. When all URLs fail validation,
            detail.failed_results describes the individual failures.
          content:
            application/json:
              schema:
                allOf:
                  - $ref: '#/components/schemas/ApiError'
                  - type: object
                    properties:
                      detail:
                        type: object
                        properties:
                          failed_results:
                            type: array
                            description: A list of URLs that could not be processed.
                            items:
                              type: object
                              properties:
                                url:
                                  type: string
                                  description: The URL that failed to be processed.
                                error:
                                  type: string
                                  description: >-
                                    An error message describing why the URL
                                    couldn't be processed.
              examples:
                tooManyUrls:
                  summary: More than 20 URLs
                  value:
                    detail:
                      error: Max 20 URLs are allowed.
                allInvalidUrls:
                  summary: No URL passes validation
                  value:
                    detail:
                      error: All URLs failed validation.
                      failed_results:
                        - url: not-a-url
                          error: 'Validation Error: Invalid URL format'
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '429':
          description: >-
            Too Many Requests. Error messages and retry delays can vary by
            rate-limit rule.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Your request has been blocked due to excessive requests.
                    Please reduce the rate of requests.
          headers:
            Retry-After:
              $ref: '#/components/headers/RetryAfter'
        '432':
          description: Key limit or Plan Limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    <432 Custom Forbidden Error (e.g This request exceeds your
                    plan's set usage limit. Please upgrade your plan or contact
                    support@tavily.com)>
        '433':
          description: PayGo limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds the pay-as-you-go limit. You can
                    increase your limit on the Tavily dashboard.
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: Internal Server Error
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: >-
            from tavily import TavilyClient


            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")

            response =
            tavily_client.extract("https://en.wikipedia.org/wiki/Artificial_intelligence")


            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: >-
            const { tavily } = require("@tavily/core");


            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });

            const response = await
            tvly.extract("https://en.wikipedia.org/wiki/Artificial_intelligence");


            console.log(response);
components:
  schemas:
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
  headers:
    RetryAfter:
      description: >-
        When present, the number of seconds to wait before retrying. Read the
        returned value; the delay can vary.
      schema:
        type: integer
        minimum: 0
      example: 60
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tavily Crawl

> Tavily Crawl is a graph-based website traversal tool that can explore hundreds of paths in parallel with built-in extraction and intelligent discovery.



## OpenAPI

````yaml POST /crawl
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /crawl:
    post:
      summary: Initiate a web crawl from a base URL
      description: >-
        Tavily Crawl is a graph-based website traversal tool that can explore
        hundreds of paths in parallel with built-in extraction and intelligent
        discovery.
      operationId: crawl
      requestBody:
        description: Parameters for the Tavily Crawl request.
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                url:
                  type: string
                  description: The root URL to begin the crawl.
                  example: docs.tavily.com
                instructions:
                  type: string
                  description: >-
                    Natural language instructions for the crawler. When
                    specified, the mapping cost increases to 2 API credits per
                    10 successful pages instead of 1 API credit per 10 pages.
                  example: Find all pages about the Python SDK
                chunks_per_source:
                  type: integer
                  description: >-
                    Chunks are short content snippets (about 800 characters
                    each) pulled directly from the source. Use
                    `chunks_per_source` to define the maximum number of relevant
                    chunks returned per source and to control the `raw_content`
                    length. Chunks will appear in the `raw_content` field as:
                    `<chunk 1> [...] <chunk 2> [...] <chunk 3>`. If a page
                    splits into no more chunks than `chunks_per_source`, its
                    full content is returned. Available only when `instructions`
                    are provided. Must be between 1 and 5.
                  minimum: 1
                  maximum: 5
                  default: 3
                max_depth:
                  type: integer
                  description: >-
                    Max depth of the crawl. Defines how far from the base URL
                    the crawler can explore.
                  default: 1
                  minimum: 1
                  maximum: 5
                max_breadth:
                  type: integer
                  description: >-
                    Max number of links to follow per level of the tree (i.e.,
                    per page).
                  default: 20
                  minimum: 1
                  maximum: 500
                limit:
                  type: integer
                  description: >-
                    Total number of links the crawler will process before
                    stopping.
                  default: 50
                  minimum: 1
                select_paths:
                  type: array
                  description: >-
                    Regex patterns to select only URLs with specific path
                    patterns (e.g., `/docs/.*`, `/api/v1.*`).
                  items:
                    type: string
                  default: null
                select_domains:
                  type: array
                  description: >-
                    Regex patterns to select crawling to specific domains or
                    subdomains (e.g., `^docs\.example\.com$`).
                  items:
                    type: string
                  default: null
                exclude_paths:
                  type: array
                  description: >-
                    Regex patterns to exclude URLs with specific path patterns
                    (e.g., `/private/.*`, `/admin/.*`).
                  items:
                    type: string
                  default: null
                exclude_domains:
                  type: array
                  description: >-
                    Regex patterns to exclude specific domains or subdomains
                    from crawling (e.g., `^private\.example\.com$`).
                  items:
                    type: string
                  default: null
                allow_external:
                  type: boolean
                  description: >-
                    Whether to include external domain links in the final
                    results list.
                  default: true
                include_images:
                  type: boolean
                  description: Whether to include images in the crawl results.
                  default: false
                extract_depth:
                  type: string
                  description: >-
                    Advanced extraction retrieves more data, including tables
                    and embedded content, with higher success but may increase
                    latency. `basic` extraction costs 1 credit per 5 successful
                    extractions, while `advanced` extraction costs 2 credits per
                    5 successful extractions.
                  enum:
                    - basic
                    - advanced
                  default: basic
                format:
                  type: string
                  description: >-
                    The format of the extracted web page content. `markdown`
                    returns content in markdown format. `text` returns plain
                    text and may increase latency.
                  enum:
                    - markdown
                    - text
                  default: markdown
                include_favicon:
                  type: boolean
                  description: Whether to include the favicon URL for each result.
                  default: false
                timeout:
                  type: number
                  format: float
                  description: >-
                    Maximum time in seconds to wait for the crawl operation
                    before timing out. Must be between 10 and 150 seconds.
                  minimum: 10
                  maximum: 150
                  default: 150
                include_usage:
                  type: boolean
                  description: >-
                    Whether to include credit usage information in the response.
                    `NOTE:`The value may be 0 if the total use of /extract and
                    /map have not yet reached minimum requirements. See our
                    [Credits & Pricing
                    documentation](https://docs.tavily.com/documentation/api-credits)
                    for details.
                  default: false
              required:
                - url
      responses:
        '200':
          description: Crawl results returned successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  base_url:
                    type: string
                    description: The base URL that was crawled.
                    example: docs.tavily.com
                  results:
                    type: array
                    description: A list of extracted content from the crawled URLs.
                    items:
                      type: object
                      properties:
                        url:
                          type: string
                          description: The URL that was crawled.
                          example: https://docs.tavily.com
                        raw_content:
                          type: string
                          description: >-
                            The full content extracted from the page. When
                            `query` is provided, contains the top-ranked chunks
                            joined by `[...]` separator.
                        favicon:
                          type: string
                          description: The favicon URL for the result.
                          example: >-
                            https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3
                    example:
                      - url: https://docs.tavily.com/welcome
                        raw_content: >-
                          Welcome - Tavily Docs


                          [Tavily Docs home page![light
                          logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark
                          logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)


                          Search or ask...


                          Ctrl K


                          - [Support](mailto:support@tavily.com)

                          - [Get an API key](https://app.tavily.com)

                          - [Get an API key](https://app.tavily.com)


                          Search...


                          Navigation


                          [Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)


                          Explore our docs


                          Your journey to state-of-the-art web search starts
                          right here.


                          [## Quickstart


                          Start searching with Tavily in
                          minutes](documentation/quickstart)[## API Reference


                          Start using Tavily's powerful
                          APIs](documentation/api-reference/endpoint/search)[##
                          API Credits Overview


                          Learn how to get and manage your Tavily API
                          Credits](documentation/api-credits)[## Rate Limits


                          Learn about Tavily's API rate limits for both
                          development and production
                          environments](documentation/rate-limits)[## Python


                          Get started with our Python SDK,
                          `tavily-python`](sdk/python/quick-start)[## Playground


                          Explore Tavily's APIs with our interactive
                          playground](https://app.tavily.com/playground)
                        favicon: >-
                          https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3
                      - url: https://docs.tavily.com/documentation/api-credits
                        raw_content: >-
                          Credits & Pricing - Tavily Docs


                          [Tavily Docs home page![light
                          logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/light.svg)![dark
                          logo](https://mintlify.s3.us-west-1.amazonaws.com/tavilyai/logo/dark.svg)](https://tavily.com/)


                          Search or ask...


                          Ctrl K


                          - [Support](mailto:support@tavily.com)

                          - [Get an API key](https://app.tavily.com)

                          - [Get an API key](https://app.tavily.com)


                          Search...


                          Navigation


                          Overview


                          Credits & Pricing


                          [Home](/welcome)[Documentation](/documentation/about)[SDKs](/sdk/python/quick-start)[Examples](/examples/use-cases/data-enrichment)[FAQ](/faq/faq)


                          - [API Playground](https://app.tavily.com/playground)

                          - [Community](https://community.tavily.com)

                          - [Blog](https://blog.tavily.com)


                          ##### Overview


                          - [About](/documentation/about)

                          - [Quickstart](/documentation/quickstart)

                          - [Credits & Pricing](/documentation/api-credits)

                          - [Rate Limits](/documentation/rate-limits)


                          ##### API Reference


                          -
                          [Introduction](/documentation/api-reference/introduction)

                          - [POST

                            Tavily Search](/documentation/api-reference/endpoint/search)
                          - [POST

                            Tavily Extract](/documentation/api-reference/endpoint/extract)
                          - [POST

                            Tavily Crawl](/documentation/api-reference/endpoint/crawl)
                          - [POST

                            Tavily Map](/documentation/api-reference/endpoint/map)

                          ##### Best Practices


                          - [Best Practices for
                          Search](/documentation/best-practices/best-practices-search)

                          - [Best Practices for
                          Extract](/documentation/best-practices/best-practices-extract)


                          ##### Tavily MCP Server


                          - [Tavily MCP Server](/documentation/mcp)


                          ##### Integrations


                          - [LangChain](/documentation/integrations/langchain)

                          - [LlamaIndex](/documentation/integrations/llamaindex)

                          - [Zapier](/documentation/integrations/zapier)

                          - [Dify](/documentation/integrations/dify)

                          - [Composio](/documentation/integrations/composio)

                          - [Make](/documentation/integrations/make)

                          - [Agno](/documentation/integrations/agno)

                          - [Pydantic
                          AI](/documentation/integrations/pydantic-ai)

                          - [FlowiseAI](/documentation/integrations/flowise)


                          ##### Legal


                          - [Security & Compliance](https://trust.tavily.com)

                          - [Privacy Policy](https://tavily.com/privacy)


                          ##### Help


                          - [Help Center](https://help.tavily.com)


                          ##### Tavily Search Crawler


                          - [Tavily Search
                          Crawler](/documentation/search-crawler)


                          Overview


                          # Credits & Pricing


                          Learn how to get and manage your Tavily API Credits.


                          ## [​](#free-api-credits) Free API Credits


                          [## Get your free API key


                          You get 1,000 free API Credits every month.

                          **No credit card required.**](https://app.tavily.com)


                          ## [​](#pricing-overview) Pricing Overview


                          Tavily operates on a simple, credit-based model:


                          - **Free**: 1,000 credits/month

                          - **Pay-as-you-go**: $0.008 per credit (allows you to
                          be charged per credit once your plan's credit limit is
                          reached).

                          - **Monthly plans**: $0.0075 - $0.005 per credit

                          - **Enterprise**: Custom pricing and volume


                          | **Plan** | **Credits per month** | **Monthly price**
                          | **Price per credit** |

                          | --- | --- | --- | --- |

                          | **Researcher** | 1,000 | Free | - |

                          | **Project** | 4,000 | $30 | $0.0075 |

                          | **Bootstrap** | 15,000 | $100 | $0.0067 |

                          | **Startup** | 38,000 | $220 | $0.0058 |

                          | **Growth** | 100,000 | $500 | $0.005 |

                          | **Pay as you go** | Per usage | $0.008 / Credit |
                          $0.008 |

                          | **Enterprise** | Custom | Custom | Custom |


                          Head to [my plan](https://app.tavily.com/account/plan)
                          to explore our different options and manage your plan.


                          ## [​](#api-credits-costs) API Credits Costs


                          ### [​](#tavily-search) Tavily Search


                          Your [search
                          depth](/api-reference/endpoint/search#body-search-depth)
                          determines the cost of your request.


                          - **Basic Search (`basic`):**
                            Each request costs **1 API credit**.
                          - **Advanced Search (`advanced`):**
                            Each request costs **2 API credits**.

                          ### [​](#tavily-extract) Tavily Extract


                          The number of successful URL extractions and your
                          [extraction
                          depth](/api-reference/endpoint/extract#body-extract-depth)
                          determines the cost of your request. You never get
                          charged if a URL extraction fails.


                          - **Basic Extract (`basic`):**
                            Every 5 successful URL extractions cost **1 API credit**
                          - **Advanced Extract (`advanced`):**
                            Every 5 successful URL extractions cost **2 API credits**

                          [Quickstart](/documentation/quickstart)[Rate
                          Limits](/documentation/rate-limits)


                          [x](https://x.com/tavilyai)[github](https://github.com/tavily-ai)[linkedin](https://linkedin.com/company/tavily)[website](https://tavily.com)


                          [Powered by
                          Mintlify](https://mintlify.com/preview-request?utm_campaign=poweredBy&utm_medium=docs&utm_source=docs.tavily.com)


                          On this page


                          - [Free API Credits](#free-api-credits)

                          - [Pricing Overview](#pricing-overview)

                          - [API Credits Costs](#api-credits-costs)

                          - [Tavily Search](#tavily-search)

                          - [Tavily Extract](#tavily-extract)
                        favicon: >-
                          https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3
                      - url: https://docs.tavily.com/documentation/about
                        raw_content: >-
                          Who are we?

                          -----------


                          We're a team of AI researchers and developers
                          passionate about helping you build the next generation
                          of AI assistants. Our mission is to empower
                          individuals and organizations with accurate, unbiased,
                          and factual information.


                          What is the Tavily Search Engine?

                          ---------------------------------


                          Building an AI agent that leverages realtime online
                          information is not a simple task. Scraping doesn't
                          scale and requires expertise to refine, current search
                          engine APIs don't provide explicit information to
                          queries but simply potential related articles (which
                          are not always related), and are not very customziable
                          for AI agent needs. This is why we're excited to
                          introduce the first search engine for AI agents -
                          [Tavily](https://app.tavily.com/).


                          Tavily is a search engine optimized for LLMs, aimed at
                          efficient, quick and persistent search results. Unlike
                          other search APIs such as Serp or Google, Tavily
                          focuses on optimizing search for AI developers and
                          autonomous AI agents. We take care of all the burden
                          of searching, scraping, filtering and extracting the
                          most relevant information from online sources. All in
                          a single API call!


                          To try the API in action, you can now use our hosted
                          version on our [API
                          Playground](https://app.tavily.com/playground).


                          Why choose Tavily?

                          ------------------


                          Tavily shines where others fail, with a Search API
                          optimized for LLMs.


                          How does the Search API work?

                          -----------------------------


                          Traditional search APIs such as Google, Serp and Bing
                          retrieve search results based on a user query.
                          However, the results are sometimes irrelevant to the
                          goal of the search, and return simple URLs and
                          snippets of content which are not always relevant.
                          Because of this, any developer would need to then
                          scrape the sites to extract relevant content, filter
                          irrelevant information, optimize the content to fit
                          LLM context limits, and more. This task is a burden
                          and requires a lot of time and effort to complete. The
                          Tavily Search API takes care of all of this for you in
                          a single API call.


                          The Tavily Search API aggregates up to 20 sites per a
                          single API call, and uses proprietary AI to score,
                          filter and rank the top most relevant sources and
                          content to your task, query or goal. In addition,
                          Tavily allows developers to add custom fields such as
                          context and limit response tokens to enable the
                          optimal search experience for LLMs.


                          Tavily can also help your AI agent make better
                          decisions by including a short answer for cross-agent
                          communication.


                          Getting started

                          ---------------


                          [Sign up](https://app.tavily.com/) for Tavily to get
                          your API key. You get **1,000 free API Credits every
                          month**. No credit card required.


                          [Get your free API key --------------------- You get
                          1,000 free API Credits every month. **No credit card
                          required.**](https://app.tavily.com/)Head to our [API
                          Playground](https://app.tavily.com/playground) to
                          familiarize yourself with our API.


                          To get started with Tavily's APIs and SDKs using code,
                          head to our [Quickstart
                          Guide](https://docs.tavily.com/guides/quickstart) and
                          follow the steps.
                        favicon: >-
                          https://mintlify.s3-us-west-1.amazonaws.com/tavilyai/_generated/favicon/apple-touch-icon.png?v=3
                  response_time:
                    type: number
                    format: float
                    description: Time in seconds it took to complete the request.
                    example: 1.23
                  usage:
                    type: object
                    description: Credit usage details for the request.
                    example:
                      credits: 1
                  request_id:
                    type: string
                    description: >-
                      A unique request identifier you can share with customer
                      support to help resolve issues with specific requests.
                    example: 123e4567-e89b-12d3-a456-426614174111
        '400':
          description: Bad Request - Your request is invalid.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[400] No starting url provided'
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '403':
          description: Forbidden - URL is not supported.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[403] URL is not supported'
        '429':
          description: >-
            Too Many Requests. Error messages and retry delays can vary by
            rate-limit rule.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Your request has been blocked due to excessive requests.
                    Please reduce the rate of requests.
          headers:
            Retry-After:
              $ref: '#/components/headers/RetryAfter'
        '432':
          description: Key limit or Plan Limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds your plan's set usage limit. Please
                    upgrade your plan or contact support@tavily.com
        '433':
          description: PayGo limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds the pay-as-you-go limit. You can
                    increase your limit on the Tavily dashboard.
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[500] Internal server error'
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: >-
            from tavily import TavilyClient


            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")

            response = tavily_client.crawl("https://docs.tavily.com",
            instructions="Find all pages on the Python SDK")


            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: >-
            const { tavily } = require("@tavily/core");


            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });

            const response = await tvly.crawl("https://docs.tavily.com", {
            instructions: "Find all pages on the Python SDK" });


            console.log(response);
components:
  schemas:
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
  headers:
    RetryAfter:
      description: >-
        When present, the number of seconds to wait before retrying. Read the
        returned value; the delay can vary.
      schema:
        type: integer
        minimum: 0
      example: 60
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Tavily Map

> Tavily Map traverses websites like a graph and can explore hundreds of paths in parallel with intelligent discovery to generate comprehensive site maps.



## OpenAPI

````yaml POST /map
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /map:
    post:
      summary: Initiate a web mapping from a base URL
      description: >-
        Tavily Map traverses websites like a graph and can explore hundreds of
        paths in parallel with intelligent discovery to generate comprehensive
        site maps.
      operationId: map
      requestBody:
        description: Parameters for the Tavily Map request.
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                url:
                  type: string
                  description: The root URL to begin the mapping.
                  example: docs.tavily.com
                instructions:
                  type: string
                  description: >-
                    Natural language instructions for the crawler. When
                    specified, the cost increases to 2 API credits per 10
                    successful pages instead of 1 API credit per 10 pages.
                  example: Find all pages about the Python SDK
                  default: null
                max_depth:
                  type: integer
                  description: >-
                    Max depth of the mapping. Defines how far from the base URL
                    the crawler can explore.
                  default: 1
                  minimum: 1
                  maximum: 5
                max_breadth:
                  type: integer
                  description: >-
                    Max number of links to follow per level of the tree (i.e.,
                    per page).
                  default: 20
                  minimum: 1
                  maximum: 500
                limit:
                  type: integer
                  description: >-
                    Total number of links the crawler will process before
                    stopping.
                  default: 50
                  minimum: 1
                select_paths:
                  type: array
                  description: >-
                    Regex patterns to select only URLs with specific path
                    patterns (e.g., `/docs/.*`, `/api/v1.*`).
                  items:
                    type: string
                  default: null
                select_domains:
                  type: array
                  description: >-
                    Regex patterns to select crawling to specific domains or
                    subdomains (e.g., `^docs\.example\.com$`).
                  items:
                    type: string
                  default: null
                exclude_paths:
                  type: array
                  description: >-
                    Regex patterns to exclude URLs with specific path patterns
                    (e.g., `/private/.*`, `/admin/.*`).
                  items:
                    type: string
                  default: null
                exclude_domains:
                  type: array
                  description: >-
                    Regex patterns to exclude specific domains or subdomains
                    from crawling (e.g., `^private\.example\.com$`).
                  items:
                    type: string
                  default: null
                allow_external:
                  type: boolean
                  description: >-
                    Whether to include external domain links in the final
                    results list.
                  default: true
                timeout:
                  type: number
                  format: float
                  description: >-
                    Maximum time in seconds to wait for the map operation before
                    timing out. Must be between 10 and 150 seconds.
                  minimum: 10
                  maximum: 150
                  default: 150
                include_usage:
                  type: boolean
                  description: >-
                    Whether to include credit usage information in the
                    response.`NOTE:`The value may be 0 if the total successful
                    pages mapped has not yet reached 10 calls. See our [Credits
                    & Pricing
                    documentation](https://docs.tavily.com/documentation/api-credits)
                    for details.
                  default: false
              required:
                - url
      responses:
        '200':
          description: Map results returned successfully
          content:
            application/json:
              schema:
                type: object
                properties:
                  base_url:
                    type: string
                    description: The base URL that was mapped.
                    example: docs.tavily.com
                  results:
                    type: array
                    description: A list of URLs that were discovered during the mapping.
                    items:
                      type: string
                      example: docs.tavily.com
                    example:
                      - https://docs.tavily.com/welcome
                      - https://docs.tavily.com/documentation/api-credits
                      - https://docs.tavily.com/documentation/about
                  response_time:
                    type: number
                    format: float
                    description: Time in seconds it took to complete the request.
                    example: 1.23
                  usage:
                    type: object
                    description: Credit usage details for the request.
                    example:
                      credits: 1
                  request_id:
                    type: string
                    description: >-
                      A unique request identifier you can share with customer
                      support to help resolve issues with specific requests.
                    example: 123e4567-e89b-12d3-a456-426614174111
        '400':
          description: Bad Request - Your request is invalid.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[400] No starting url provided'
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '403':
          description: Forbidden - URL is not supported.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[403] URL is not supported'
        '429':
          description: >-
            Too Many Requests. Error messages and retry delays can vary by
            rate-limit rule.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Your request has been blocked due to excessive requests.
                    Please reduce the rate of requests.
          headers:
            Retry-After:
              $ref: '#/components/headers/RetryAfter'
        '432':
          description: Key limit or Plan Limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds your plan's set usage limit. Please
                    upgrade your plan or contact support@tavily.com
        '433':
          description: PayGo limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds the pay-as-you-go limit. You can
                    increase your limit on the Tavily dashboard.
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: '[500] Internal server error'
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: |-
            from tavily import TavilyClient

            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")
            response = tavily_client.map("https://docs.tavily.com")

            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: |-
            const { tavily } = require("@tavily/core");

            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });
            const response = await tvly.map("https://docs.tavily.com");

            console.log(response);
components:
  schemas:
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
  headers:
    RetryAfter:
      description: >-
        When present, the number of seconds to wait before retrying. Read the
        returned value; the delay can vary.
      schema:
        type: integer
        minimum: 0
      example: 60
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Create Research Task

> Tavily Research performs comprehensive research on a given topic by conducting multiple searches, analyzing sources, and generating a detailed research report.



## OpenAPI

````yaml POST /research
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /research:
    post:
      summary: Initiate a research task
      description: >-
        Tavily Research performs comprehensive research on a given topic by
        conducting multiple searches, analyzing sources, and generating a
        detailed research report.
      operationId: createResearch
      requestBody:
        description: Parameters for the Tavily Research request.
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                input:
                  type: string
                  description: The research task or question to investigate.
                  example: What are the latest developments in AI?
                model:
                  type: string
                  description: >-
                    The model used by the research agent. "mini" is optimized
                    for targeted, efficient research and works best for narrow
                    or well-scoped questions. "pro" provides comprehensive,
                    multi-angle research and is suited for complex topics that
                    span multiple subtopics or domains
                  enum:
                    - mini
                    - pro
                    - auto
                  default: auto
                stream:
                  type: boolean
                  description: >-
                    Whether to stream the research results as they are
                    generated. When 'true', returns a Server-Sent Events (SSE)
                    stream. See [Streaming
                    documentation](/documentation/api-reference/endpoint/research-streaming)
                    for details.
                  default: false
                output_schema:
                  type: object
                  description: >-
                    A JSON Schema object that defines the structure of the
                    research output. When provided, the research response will
                    be structured to match this schema, ensuring a predictable
                    and validated output shape. Must include a 'properties'
                    field, and may optionally include 'required' field.
                  default: null
                  properties:
                    properties:
                      type: object
                      description: >-
                        An object containing property definitions. Each key is a
                        property name, and each value is a property schema.
                      additionalProperties:
                        type: object
                        properties:
                          type:
                            type: string
                            enum:
                              - object
                              - string
                              - integer
                              - number
                              - array
                            description: >-
                              The type of the property. Must be one of: object,
                              string, integer, number, or array.
                          description:
                            type: string
                            description: A description of the property.
                          properties:
                            type: object
                            description: >-
                              Required when type is 'object'. Recursive
                              definition of object properties.
                          items:
                            type: object
                            description: >-
                              Required when type is 'array'. Defines the schema
                              for array items.
                        required:
                          - type
                          - description
                    required:
                      type: array
                      description: >-
                        An array of property names that are required. At least
                        one key from the properties object must be included.
                      items:
                        type: string
                  example:
                    properties:
                      company:
                        type: string
                        description: The name of the company
                      key_metrics:
                        type: array
                        description: List of key performance metrics
                        items:
                          type: string
                      financial_details:
                        type: object
                        description: Detailed financial breakdown
                        properties:
                          operating_income:
                            type: number
                            description: Operating income for the period
                    required:
                      - company
                citation_format:
                  type: string
                  description: The format for citations in the research report.
                  enum:
                    - numbered
                    - mla
                    - apa
                    - chicago
                  default: numbered
                include_domains:
                  type: array
                  items:
                    type: string
                  maxItems: 20
                  description: >-
                    Soft preference for sources. The research agent prioritizes
                    these domains, but URLs from other domains can still appear
                    in the final report. Matching is host-based and includes
                    subdomains (e.g., `sec.gov` matches `sec.gov` and
                    `data.sec.gov`). Maximum 20 entries.
                  default: []
                  example:
                    - sec.gov
                    - ec.europa.eu
                exclude_domains:
                  type: array
                  items:
                    type: string
                  maxItems: 20
                  description: >-
                    Hard blocklist. No URL from a listed domain or any of its
                    subdomains appears in the response. Subdomain matching is
                    downward only — blocking `medium.com` also blocks
                    `blog.medium.com`, but blocking `blog.medium.com` leaves
                    `medium.com` itself allowed. Maximum 20 entries.
                  default: []
                  example:
                    - reddit.com
                    - quora.com
                output_length:
                  type: string
                  description: >-
                    Typed control over response size. Ranges are targets, not
                    hard caps — individual responses can fall outside when the
                    question requires it.
                  enum:
                    - short
                    - standard
                    - long
                  default: standard
                files:
                  type: array
                  description: >-
                    Attach files to the research request and the agent uses
                    their contents as a source alongside the web. Each entry
                    carries a filename and its base64-encoded contents. The
                    agent reads the relevant parts of each file, grounds its
                    answer in them, and cites any file it draws from.


                    Supported file types: `.txt`, `.md`, `.json`.


                    Limits: up to 5 files per request; max 80,000 words per text
                    file; max 80,000 words combined across all files.
                  maxItems: 5
                  items:
                    type: object
                    properties:
                      name:
                        type: string
                        description: >-
                          The filename, including its extension (`.txt`, `.md`,
                          or `.json`).
                      data:
                        type: string
                        description: The base64-encoded file contents.
                      type:
                        type: string
                        description: The encoding of the `data` field.
                        enum:
                          - base64
                        default: base64
                    required:
                      - name
                      - data
                  example:
                    - name: q1-report.md
                      data: <base64-encoded file contents>
                      type: base64
              required:
                - input
      responses:
        '201':
          description: Research task queued successfully (when not streaming)
          content:
            application/json:
              schema:
                type: object
                properties:
                  request_id:
                    type: string
                    description: A unique identifier for the research task.
                    example: 123e4567-e89b-12d3-a456-426614174111
                  created_at:
                    type: string
                    description: Timestamp when the research task was created.
                    example: '2025-01-15T10:30:00Z'
                  status:
                    type: string
                    description: The current status of the research task.
                    example: pending
                  input:
                    type: string
                    description: The research task or question investigated.
                    example: What are the latest developments in AI?
                  model:
                    type: string
                    description: The model used by the research agent.
                    example: mini
                  response_time:
                    type: integer
                    description: Time in seconds it took to complete the request.
                    example: 1.23
                required:
                  - request_id
                  - created_at
                  - status
                  - input
                  - model
                  - response_time
              example:
                request_id: 123e4567-e89b-12d3-a456-426614174111
                created_at: '2025-01-15T10:30:00Z'
                status: pending
                input: What are the latest developments in AI?
                model: mini
                response_time: 1.23
        '400':
          description: Bad Request - Your request is invalid.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Invalid model. Must be one of: mini, pro, auto'
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '429':
          description: >-
            Too Many Requests. Error messages and retry delays can vary by
            rate-limit rule.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    Your request has been blocked due to excessive requests.
                    Please reduce the rate of requests.
          headers:
            Retry-After:
              $ref: '#/components/headers/RetryAfter'
        '432':
          description: Key limit or Plan Limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds your plan's set usage limit. Please
                    upgrade your plan or contact support@tavily.com
        '433':
          description: PayGo limit exceeded
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: >-
                    This request exceeds the pay-as-you-go limit. You can
                    increase your limit on the Tavily dashboard.
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: Error when executing research task
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: >-
            from tavily import TavilyClient


            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")

            response = tavily_client.research("What are the latest developments
            in AI?")


            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: >-
            const { tavily } = require("@tavily/core");


            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });

            const response = await tvly.research("What are the latest
            developments in AI?");


            console.log(response);
components:
  schemas:
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
  headers:
    RetryAfter:
      description: >-
        When present, the number of seconds to wait before retrying. Read the
        returned value; the delay can vary.
      schema:
        type: integer
        minimum: 0
      example: 60
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Get Research Task Status

> Retrieve the status and results of a research task using its request ID.



## OpenAPI

````yaml GET /research/{request_id}
openapi: 3.0.3
info:
  title: Tavily Search and Extract API
  description: >-
    Our REST API provides seamless access to Tavily Search, a powerful search
    engine for LLM agents, and Tavily Extract, an advanced web scraping solution
    optimized for LLMs.
  version: 1.0.0
servers:
  - url: https://api.tavily.com/
security: []
tags:
  - name: Search
  - name: Extract
  - name: Crawl
  - name: Map
  - name: Research
  - name: Feedback
  - name: Usage
  - name: Logs
paths:
  /research/{request_id}:
    get:
      summary: Get research task status and results
      description: Retrieve the status and results of a research task using its request ID.
      operationId: getResearch
      parameters:
        - name: request_id
          in: path
          required: true
          description: The unique identifier of the research task.
          schema:
            type: string
          example: 123e4567-e89b-12d3-a456-426614174111
        - name: include_usage
          in: query
          required: false
          description: Whether to include credit usage information in the response.
          schema:
            type: boolean
            default: false
      responses:
        '200':
          description: Research task is completed or failed.
          content:
            application/json:
              schema:
                oneOf:
                  - $ref: '#/components/schemas/ResearchTaskCompleted'
                  - $ref: '#/components/schemas/ResearchTaskFailed'
                discriminator:
                  propertyName: status
                  mapping:
                    completed: '#/components/schemas/ResearchTaskCompleted'
                    failed: '#/components/schemas/ResearchTaskFailed'
        '202':
          description: Research task is not yet completed (pending or in_progress).
          content:
            application/json:
              schema:
                type: object
                properties:
                  request_id:
                    type: string
                    description: The unique identifier of the research task.
                    example: 123e4567-e89b-12d3-a456-426614174111
                  status:
                    type: string
                    description: Current status of the research task.
                    enum:
                      - pending
                      - in_progress
                  response_time:
                    type: integer
                    description: Time in seconds it took to complete the request.
                    example: 1.23
                required:
                  - request_id
                  - response_time
                  - status
              example:
                request_id: 123e4567-e89b-12d3-a456-426614174111
                status: in_progress
                response_time: 1.23
        '401':
          description: Unauthorized - Your API key is wrong or missing.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: 'Unauthorized: missing or invalid API key.'
        '404':
          description: Research task not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: Research task not found
        '500':
          description: Internal Server Error - We had a problem with our server.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ApiError'
              example:
                detail:
                  error: Error getting research status
      security:
        - bearerAuth: []
      x-codeSamples:
        - lang: python
          label: Python SDK
          source: >-
            from tavily import TavilyClient


            tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")

            response =
            tavily_client.get_research("123e4567-e89b-12d3-a456-426614174111")


            print(response)
        - lang: javascript
          label: JavaScript SDK
          source: >-
            const { tavily } = require("@tavily/core");


            const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });

            const response = await
            tvly.get_research("123e4567-e89b-12d3-a456-426614174111");


            console.log(response);
components:
  schemas:
    ResearchTaskCompleted:
      title: Completed
      type: object
      properties:
        request_id:
          type: string
          description: The unique identifier of the research task.
          example: 123e4567-e89b-12d3-a456-426614174111
        created_at:
          type: string
          description: Timestamp when the research task was created.
          example: '2025-01-15T10:30:00Z'
        status:
          type: string
          description: The current status of the research task.
          enum:
            - completed
        content:
          oneOf:
            - type: string
            - type: object
          description: >-
            The research report content. Can be a string or a structured object
            if output_schema was provided.
        sources:
          type: array
          description: List of sources used in the research.
          items:
            type: object
            properties:
              title:
                type: string
                description: Title or name of the source.
                example: Latest AI Developments
              url:
                type: string
                format: uri
                description: URL of the source.
                example: https://example.com/ai-news
              favicon:
                type: string
                format: uri
                description: URL to the source's favicon.
                example: https://example.com/favicon.ico
        response_time:
          type: integer
          description: Time in seconds it took to complete the request.
          example: 1.23
        usage:
          type: object
          description: Credit usage details for the request.
          example:
            credits: 16
      required:
        - request_id
        - created_at
        - status
        - content
        - sources
        - response_time
      example:
        request_id: 123e4567-e89b-12d3-a456-426614174111
        created_at: '2025-01-15T10:30:00Z'
        status: completed
        content: >-
          Research Report: Latest Developments in AI


          ## Executive Summary


          Artificial Intelligence has seen significant advancements in recent
          months, with major breakthroughs in large language models, multimodal
          AI systems, and real-world applications...
        sources:
          - title: Latest AI Developments
            url: https://example.com/ai-news
            favicon: https://example.com/favicon.ico
          - title: AI Research Breakthroughs
            url: https://example.com/ai-research
            favicon: https://example.com/favicon.ico
        response_time: 1.23
        usage:
          credits: 16
    ResearchTaskFailed:
      title: Failed
      type: object
      properties:
        request_id:
          type: string
          description: The unique identifier of the research task.
          example: 123e4567-e89b-12d3-a456-426614174111
        status:
          type: string
          description: The current status of the research task.
          enum:
            - failed
        response_time:
          type: integer
          description: Time in seconds it took to complete the request.
          example: 1.23
        usage:
          type: object
          description: Credit usage details for the request.
          example:
            credits: 16
      required:
        - request_id
        - status
        - response_time
      example:
        request_id: 123e4567-e89b-12d3-a456-426614174111
        status: failed
        usage:
          credits: 0
    ApiError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: >-
        Bearer authentication header in the form Bearer <token>, where <token>
        is your Tavily API key (e.g., Bearer tvly-YOUR_API_KEY).

````

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.tavily.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Streaming

> Stream real-time research progress and results from Tavily Research API

## Overview

When using the Tavily Research API, you can stream responses in real-time by setting `stream: true` in your request. This allows you to receive research progress updates, tool calls, and final results as they're generated, providing a better user experience for long-running research tasks.

Streaming is particularly useful for:

* Displaying research progress to users in real-time
* Monitoring tool calls and search queries as they execute
* Receiving incremental updates during lengthy research operations
* Building interactive research interfaces

## Enabling Streaming

To enable streaming, set the `stream` parameter to `true` when making a request to the Research endpoint:

```json theme={null}
{
  "input": "What are the latest developments in AI?",
  "stream": true
}
```

The API will respond with a `text/event-stream` content type, sending Server-Sent Events (SSE) as the research progresses.

## Event Structure

Each streaming event follows a consistent structure compatible with the OpenAI chat completions format:

```json theme={null}
{
  "id": "123e4567-e89b-12d3-a456-426614174111",
  "object": "chat.completion.chunk",
  "model": "mini",
  "created": 1705329000,
  "choices": [
    {
      "delta": {
        // Event-specific data here
      }
    }
  ]
}
```

### Core Fields

| Field | Type | Description |
| - | - | - |
| `id` | string | Unique identifier for the stream event |
| `object` | string | Always `"chat.completion.chunk"` for streaming events |
| `model` | string | The research model being used (`"mini"` or `"pro"`) |
| `created` | integer | Unix timestamp when the event was created |
| `choices` | array | Array containing the delta with event details |

## Event Types

The streaming response includes different types of events in the `delta` object. Here are the main event types you'll encounter:

### 1. Tool Call Events

When the research agent performs actions like web searches, you'll receive tool call events:

```json theme={null}
{
  "id": "evt_002",
  "object": "chat.completion.chunk",
  "model": "mini",
  "created": 1705329005,
  "choices": [
    {
      "delta": {
        "role": "assistant",
        "tool_calls": {
          "type": "tool_call",
          "tool_call": [
            {
              "name": "WebSearch",
              "id": "fc_633b5932-e66c-4523-931a-04a7b79f2578",
              "arguments": "Executing 5 search queries",
              "queries": ["latest AI developments 2024", "machine learning breakthroughs", "..."]
            }
          ]
        }
      }
    }
  ]
}
```

**Tool Call Delta Fields:**

| Field | Type | Description |
| - | - | - |
| `type` | string | Either `"tool_call"` or `"tool_response"` |
| `tool_call` | array | Details about the tool being invoked |
| `name` | string | Name of the tool (see [Tool Types](#tool-types) below) |
| `id` | string | Unique identifier for the tool call |
| `arguments` | string | Description of the action being performed |
| `queries` | array | *(WebSearch only)* The search queries being executed |
| `parent_tool_call_id` | string | *(Pro mode only)* ID of the parent tool call for nested operations |

### 2. Tool Response Events

After a tool executes, you'll receive response events with discovered sources:

```json theme={null}
{
  "id": "evt_003",
  "object": "chat.completion.chunk",
  "model": "mini",
  "created": 1705329010,
  "choices": [
    {
      "delta": {
        "role": "assistant",
        "tool_calls": {
          "type": "tool_response",
          "tool_response": [
            {
              "name": "WebSearch",
              "id": "fc_633b5932-e66c-4523-931a-04a7b79f2578",
              "arguments": "Completed executing search tool call",
              "sources": [
                {
                  "url": "https://example.com/article",
                  "title": "Example Article",
                  "favicon": "https://example.com/favicon.ico"
                }
              ]
            }
          ]
        }
      }
    }
  ]
}
```

**Tool Response Fields:**

| Field | Type | Description |
| - | - | - |
| `name` | string | Name of the tool that completed |
| `id` | string | Unique identifier matching the original tool call |
| `arguments` | string | Completion status message |
| `sources` | array | Sources discovered by the tool (with `url`, `title`, `favicon`) |
| `parent_tool_call_id` | string | *(Pro mode only)* ID of the parent tool call |

### 3. Content Events

The final research report is streamed as content chunks:

```json theme={null}
{
  "id": "evt_004",
  "object": "chat.completion.chunk",
  "model": "mini",
  "created": 1705329015,
  "choices": [
    {
      "delta": {
        "role": "assistant",
        "content": "# Research Report\n\nBased on the latest sources..."
      }
    }
  ]
}
```

**Content Field:**

* Can be a **string** (markdown-formatted report chunks) when no `output_schema` is provided
* Can be an **object** (structured data) when an `output_schema` is specified

### 4. Sources Event

After the content is streamed, a sources event is emitted containing all sources used in the research:

```json theme={null}
{
  "id": "evt_005",
  "object": "chat.completion.chunk",
  "model": "mini",
  "created": 1705329020,
  "choices": [
    {
      "delta": {
        "role": "assistant",
        "sources": [
          {
            "url": "https://example.com/article",
            "title": "Example Article Title",
            "favicon": "https://example.com/favicon.ico"
          }
        ]
      }
    }
  ]
}
```

**Source Object Fields:**

| Field | Type | Description |
| - | - | - |
| `url` | string | The URL of the source |
| `title` | string | The title of the source page |
| `favicon` | string | URL to the source's favicon |

### 5. Done Event

Signals the completion of the streaming response:

```
event: done
```

## Tool Types

During research, you'll encounter the following tool types in streaming events:

| Tool Name | Description | Model |
| - | - | - |
| `Planning` | Initializes the research plan based on the input query | Both |
| `Generating` | Generates the final research report from collected information | Both |
| `WebSearch` | Executes web searches to gather information | Both |
| `ResearchSubtopic` | Conducts deep research on specific subtopics | Pro only |

### Research Flow Example

A typical streaming session follows this sequence:

1. **Planning** tool\_call → Initializing research plan
2. **Planning** tool\_response → Research plan initialized
3. **WebSearch** tool\_call → Executing search queries (with `queries` array)
4. **WebSearch** tool\_response → Search completed (with `sources` array)
5. *(Pro mode)* **ResearchSubtopic** tool\_call/response cycles for deeper research
6. **Generating** tool\_call → Generating final report
7. **Generating** tool\_response → Report generated
8. **Content** events → Streamed report chunks
9. **Sources** event → Complete list of all sources used
10. **Done** event → Stream complete

## Handling Streaming Responses

### Python Example

```python theme={null}
from tavily import TavilyClient

# Step 1. Instantiating your TavilyClient
tavily_client = TavilyClient(api_key="tvly-YOUR_API_KEY")

# Step 2. Creating a streaming research task
stream = tavily_client.research(
    input="Research the latest developments in AI",
    model="pro",
    stream=True
)

for chunk in stream:
    print(chunk.decode('utf-8'))
```

### JavaScript Example

```javascript theme={null}
const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: "tvly-YOUR_API_KEY" });

const stream = await tvly.research("Research the latest developments in AI", {
  model: "pro",
  stream: true,
});

for await (const chunk of result as AsyncGenerator<Buffer, void, unknown>) {
    console.log(chunk.toString('utf-8'));
}
```

## Structured Output with Streaming

When using `output_schema` to request structured data, the `content` field will contain an object instead of a string:

```json theme={null}
{
  "delta": {
    "role": "assistant",
    "content": {
      "company": "Acme Corp",
      "key_metrics": ["Revenue: $1M", "Growth: 50%"],
      "summary": "Company showing strong growth..."
    }
  }
}
```

## Error Handling

If an error occurs during streaming, you may receive an error event:

```json theme={null}
{
  "id": "1d77bdf5-38a4-46c1-87a6-663dbc4528ec",
  "object": "error",
  "error": "An error occurred while streaming the research task"
}
```

Always implement proper error handling in your streaming client to gracefully handle these cases.

## Non-Streaming Alternative

If you don't need real-time updates, set `stream: false` (or omit the parameter) to receive a single complete response:

```json theme={null}
{
  "request_id": "123e4567-e89b-12d3-a456-426614174111",
  "created_at": "2025-01-15T10:30:00Z",
  "status": "pending",
  "input": "What are the latest developments in AI?",
  "model": "mini",
  "response_time": 1.23
}
```

You can then poll the status endpoint to check when the research is complete.

