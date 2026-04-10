#!/bin/bash
KEY="11ec65e826b3c7b2a5e77f0e141fa01a768c42eecf09c1cc82080ea1dd86d831"
URL="http://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService03/getMdcinGrnIdntfcInfoList03"
MAX=12

for i in $(seq 1 $MAX); do
    NOW=$(date '+%H:%M:%S')
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${URL}?serviceKey=${KEY}&pageNo=1&numOfRows=1&type=json")
    echo "[$NOW] Attempt $i/$MAX -> HTTP $STATUS"

    if [ "$STATUS" = "200" ]; then
        echo "API ACTIVE! Crawling..."
        cd D:/PillScan/webapp
        python scripts/crawl_pill_id_v03.py

        if [ -f "data/pill_identification.json" ]; then
            COUNT=$(python3 -c "import json; d=json.load(open('data/pill_identification.json')); print(len(d))")
            echo "Crawled $COUNT records. Deploying..."

            git add data/pill_identification.json data/pill_id_progress.json scripts/crawl_pill_id_v03.py
            git commit -m "data: add $COUNT pill identification records (shape/color/imprint) from MFDS v03 API"
            git push

            npx vercel --prod --yes 2>&1 | grep -E "Aliased:|READY"
            npx vercel alias set webapp-lovat-eta.vercel.app pillscan-ai.vercel.app 2>&1 | tail -1

            echo "DONE! $COUNT pill ID records deployed to pillscan-ai.vercel.app"
        fi
        exit 0
    fi

    [ "$i" -lt "$MAX" ] && echo "Sleeping 30 min..." && sleep 1800
done
echo "API still 403 after 6 hours. Manual check needed."
