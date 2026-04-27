import sys
sys.stdout.reconfigure(encoding='utf-8')
js = open('app.js', encoding='utf-8').read()

# find training video storage
for kw in ['companyVideos', 'training_videos', 'trainingKey', '_trainingKey', 'loadTrainingScreen', 'training-videos-list', 'co-training']:
    idx = js.find(kw)
    if idx >= 0:
        print(f'=== {kw} at {idx} ===')
        print(js[idx:idx+300])
        print()
