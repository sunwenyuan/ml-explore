function distance(a: number[], b: number[]): number {
    const diffArray = a.map((aPoint, index) => b[index] - aPoint);
    const squareSum = diffArray.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(squareSum);
}

interface NearestPointsMap {
    index: number;
    distance: number;
    label: string;
}

export class KNN {
    constructor(
        public k: number,
        public data: number[][],
        public labels: string[]
    ) { }

    generateDistanceMap(point: number[]): NearestPointsMap[] {
        const map: NearestPointsMap[] = [];
        let maxDistanceInMap;

        for (let i = 0; i < this.data.length; i++) {
            const otherPoint = this.data[i];
            const otherPointLabel = this.labels[i];
            const thisDistance = distance(point, otherPoint);

            if (!maxDistanceInMap || thisDistance < maxDistanceInMap) {
                map.push({
                    index: i,
                    distance: thisDistance,
                    label: otherPointLabel
                });

                map.sort((a, b) => a.distance < b.distance ? -1 : 1);

                if (map.length > this.k) {
                    map.pop();
                }

                maxDistanceInMap = map[map.length - 1].distance;
            }
        }
        return map;
    }

    predict(point: number[]) {
        const map: NearestPointsMap[] = this.generateDistanceMap(point);
        const votes = map.slice(0, this.k);
        const voteCounts = votes.reduce((obj, vote) => Object.assign({}, obj, { [vote.label]: (obj[vote.label] || 0) + 1 }), {});
        const sortedVotes = Object.keys(voteCounts)
            .map(label => ({
                label,
                count: voteCounts[label]
            }))
            .sort((a, b) => a.count > b.count ? -1 : 1);

        return {
            label: sortedVotes[0].label,
            voteCounts,
            votes
        };
    }
}