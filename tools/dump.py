# Writes theme files from a saved Shopify Admin GraphQL files() result to disk.
# Usage: python3 -I dump.py <result.json> <outdir> <theme alias>
import json, sys, os
# dump.py <result-file> <outdir> <alias>
d = json.load(open(sys.argv[1], encoding='utf-8'))
if isinstance(d, list): d = json.loads(d[0]['text'])
nodes = d['data'][sys.argv[3]]['files']['nodes']
for n in nodes:
    b = n.get('body') or {}
    if 'content' not in b: print('NOBODY', n['filename']); continue
    p = os.path.join(sys.argv[2], n['filename']); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, 'w', encoding='utf-8').write(b['content'])
pi = d['data'][sys.argv[3]]['files'].get('pageInfo')
print(len(nodes), 'written', pi)
