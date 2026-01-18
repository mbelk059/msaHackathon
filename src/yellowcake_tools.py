"""
YellowCake Scraper Tool for Solace Agent Mesh.
Returns monolithic JSON objects for stability.
"""
import requests
import json
import urllib.parse
from typing import Optional, Dict, Any, List

# Default key (replace with your env var or keep if testing locally)
DEFAULT_API_KEY = "yc_live_Co2fXYNt4Jp8xgxCEqoXUmql5FfDzM2PFvyUGkBHV4I=" 

def _perform_accumulated_scrape(url: str, prompt: str, api_key: str, max_wait_seconds: int = 60) -> List[Dict[str, Any]]:
    """
    Internal helper: Hits YellowCake, reads the ENTIRE stream, 
    and returns a clean list of result objects.
    """
    endpoint = "https://api.yellowcake.dev/v1/extract-stream"
    
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key
    }

    # Stealth config to bypass Google blocking
    payload = {
        "url": url,
        "prompt": prompt,
        "throttleMode": True,      
        "proxy_type": "residential",
        "country": "us",
        "stealth": True,
        "extra_headers": { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.google.com/"
        }
    }

    accumulated_data = []

    try:
        # We use stream=True to process the data as it arrives, 
        # but we won't return until we've collected everything.
        with requests.post(
            endpoint, 
            headers=headers, 
            json=payload, 
            stream=True, 
            timeout=(10, max_wait_seconds)
        ) as response:
            
            response.raise_for_status()

            for line in response.iter_lines():
                if line:
                    text_line = line.decode('utf-8', errors='replace')
                    
                    if text_line.startswith('data: '):
                        data_str = text_line[6:]
                        try:
                            item = json.loads(data_str)
                            
                            # Handle different response shapes (single obj vs list)
                            if 'data' in item and isinstance(item['data'], list):
                                # It's a batch of results
                                for sub_item in item['data']:
                                    clean_item = _normalize_item(sub_item)
                                    if clean_item: accumulated_data.append(clean_item)
                            else:
                                # It's a single result
                                clean_item = _normalize_item(item)
                                if clean_item: accumulated_data.append(clean_item)

                        except json.JSONDecodeError:
                            continue
                            
    except Exception as e:
        print(f"DEBUG: Scrape warning: {e}")
        # We don't crash here; we just return whatever we found so far.

    return accumulated_data

def _normalize_item(item: Dict) -> Optional[Dict]:
    """Standardizes the output format regardless of what the scraper returns."""
    url = item.get('website_url') or item.get('url') or item.get('link')
    if not url: return None

    return {
        "title": item.get('article_title') or item.get('title') or "No Title",
        "url": url,
        "summary": item.get('description') or item.get('snippet') or item.get('text') or ""
    }

# --- TOOL 1: THE SEARCHER (Returns Large JSON) ---
def google_like_search(
    query: str,
    max_results: int = 5,
    yellowcake_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Performs a Google search using YellowCake proxies and returns 
    a single aggregated JSON object containing all results.
    """
    api_key = yellowcake_api_key or DEFAULT_API_KEY
    
    # 1. Input Validation
    if not query or not query.strip():
        return {
            "success": False,
            "error": "Empty query provided",
            "query": query,
            "results": []
        }

    # 2. Construct Google URL
    encoded_query = urllib.parse.quote_plus(query.strip())
    search_url = f"https://www.google.com/search?q={encoded_query}"
    
    print(f"DEBUG: Agent requesting Google Search for: {query}")

    # 3. Execute Scrape (Accumulate results)
    # We ask the scraper specifically for "search results" to guide the AI extraction
    raw_results = _perform_accumulated_scrape(
        search_url, 
        prompt="Extract search result titles, links, and snippets", 
        api_key=api_key
    )

    # 4. Filter and Limit
    # Remove duplicates based on URL
    seen_urls = set()
    unique_results = []
    
    for res in raw_results:
        if res['url'] not in seen_urls:
            unique_results.append(res)
            seen_urls.add(res['url'])
            
            if len(unique_results) >= max_results:
                break

    # 5. Return Monolithic JSON Object
    return {
        "success": True,
        "query": query,
        "result_count": len(unique_results),
        "results": unique_results
    }

# --- TOOL 2: THE READER (Returns Large JSON) ---
def scrape_url(
    url: str, 
    prompt: str = "Extract all main content, including text, data, and key facts",
    yellowcake_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Scrapes a single URL and returns the content as a single JSON object.
    """
    api_key = yellowcake_api_key or DEFAULT_API_KEY
    
    print(f"DEBUG: Agent requesting scrape of: {url}")
    
    results = _perform_accumulated_scrape(url, prompt, api_key)
    
    # For a single page scrape, we combine all snippets found into one large text body
    full_text = "\n\n".join([r['summary'] for r in results])
    title = results[0]['title'] if results else "Unknown Title"

    return {
        "success": True,
        "url": url,
        "title": title,
        "content": full_text
    }

if __name__ == "__main__":
       # Test search
       result = google_like_search("test query", max_results=3)
       print(f"Search test: {result}")
       
       # Test scrape
       if result['success'] and result['results']:
           url = result['results'][0]['url']
           scrape_result = scrape_url(url)
           print(f"Scrape test: {scrape_result}")