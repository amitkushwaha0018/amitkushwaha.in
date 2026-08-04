import urllib.request
import re
import json

url = 'https://www.youtube.com/@amitkushwaha0018'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
})

try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    data_match = re.search(r'var ytInitialData = (\{.*?\});</script>', html)
    if data_match:
        data = json.loads(data_match.group(1))
        header = data.get('header', {}).get('pageHeaderRenderer', {}).get('content', {}).get('pageHeaderViewModel', {})
        metadata = header.get('metadata', {}).get('contentMetadataViewModel', {}).get('metadataRows', [])
        print("Metadata rows count:", len(metadata))
        for row in metadata:
            for item in row.get('metadataParts', []):
                text = item.get('text', {}).get('content')
                print("Part text:", text)
except Exception as e:
    print("Error:", e)
