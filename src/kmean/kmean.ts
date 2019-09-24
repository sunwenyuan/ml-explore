function mean(numbers: number[]): number {
    return numbers.reduce((val, sum) => val + sum, 0) / numbers.length;
}

function distance(a: number[], b: number[]): number {
    const diffArray = a.map((aPoint, index) => b[index] - aPoint);
    const squareSum = diffArray.reduce((sum, val) => sum + val * val, 0);
    return Math.sqrt(squareSum);
}

interface IDimensionRange {
    min: number;
    max: number;
}

export class KMeans {
    error: any;
    iterations: number = 0;
    iterationLogs: any[] = [];
    centroids: number[][];
    centroidAssignments: number[];

    constructor(public k: number, public data: number[][]) {
        this.reset();
    }

    reset() {
        this.error = null;
        this.iterations = 0;
        this.iterationLogs = [];
        this.centroids = this.initRandomCentroids();
        this.centroidAssignments = [];
    }

    getDimensionality(): number {
        return this.data[0].length;
    }

    getRangeForDimensiton(n: number): IDimensionRange {
        const values = this.data.map((item) => item[n]);
        return {
            min: Math.min(...values),
            max: Math.max(...values)
        };
    }

    getAllDimensionRanges(): IDimensionRange[] {
        const dimensionRanges: IDimensionRange[] = [];
        const dimensionality = this.getDimensionality();
        for (let dimension = 0; dimension < dimensionality; dimension++) {
            dimensionRanges.push(this.getRangeForDimensiton(dimension));
        }
        return dimensionRanges;
    }

    initRandomCentroids(): number[][] {
        const dimensionality = this.getDimensionality();
        const dimensionRanges = this.getAllDimensionRanges();
        const centroids = [];

        for (let i = 0; i < this.k; i++) {
            const point: number[] = [];
            for (let dimension = 0; dimension < dimensionality; dimension++) {
                const { min, max } = dimensionRanges[dimension];
                point[dimension] = min + Math.random() * (max - min);
            }
            centroids.push(point);
        }
        return centroids;
    }

    assignPointToCentroid(pointIndex: number): boolean {
        const lastAssignedCentroid: number = this.centroidAssignments[pointIndex];
        const point: number[] = this.data[pointIndex];
        let minDistance = null;
        let assignedCentroid = null;
        for (let i = 0; i < this.centroids.length; i++) {
            const centroid = this.centroids[i];
            const distanceToCentroid = distance(point, centroid);
            if (minDistance === null || distanceToCentroid < minDistance) {
                minDistance = distanceToCentroid;
                assignedCentroid = i;
            }
        }
        this.centroidAssignments[pointIndex] = assignedCentroid;
        return lastAssignedCentroid !== assignedCentroid;
    }

    assignPointsToCentroids(): boolean {
        let didAnyPointsGetReassigned = false;
        for (let i = 0; i < this.data.length; i++) {
            const wasReassigned = this.assignPointToCentroid(i);
            if (wasReassigned === true) {
                didAnyPointsGetReassigned = true;
            }
        }
        return didAnyPointsGetReassigned;
    }

    getPointsForCentroid(centroidIndex: number): number[][] {
        const points: number[][] = [];
        for (let i = 0; i < this.data.length; i++) {
            const assignment = this.centroidAssignments[i];
            if (assignment === centroidIndex) {
                points.push(this.data[i]);
            }
        }
        return points;
    }

    updateCentroidLocation(centroidIndex: number): number[] {
        const thisCentroidPoints = this.getPointsForCentroid(centroidIndex);
        const dimensionality = this.getDimensionality();
        const newCentroid: number[] = [];
        for (let dimension = 0; dimension < dimensionality; dimension++) {
            newCentroid[dimension] = mean(thisCentroidPoints.map(item => item[dimension]));
        }
        this.centroids[centroidIndex] = newCentroid;
        return newCentroid;
    }

    updateCentroidLocations() {
        for (let i = 0; i < this.centroids.length; i++) {
            this.updateCentroidLocation(i);
        }
    }

    calculateError() {
        let sumDistanceSquared = 0;
        for (let i = 0; i < this.data.length; i++) {
            const centroidIndex = this.centroidAssignments[i];
            const centroid = this.centroids[centroidIndex];
            const point = this.data[i];
            const thisDistance = distance(point, centroid);
            sumDistanceSquared += thisDistance * thisDistance;
        }

        this.error = Math.sqrt(sumDistanceSquared / this.data.length);
        return this.error;
    }

    solve(maxIterations: number = 1000) {
        while (this.iterations < maxIterations) {
            const didAssignmentsChange = this.assignPointsToCentroids();
            this.updateCentroidLocations();
            this.calculateError();

            this.iterationLogs[this.iterations] = {
                centroids: [...this.centroids],
                iteration: this.iterations,
                error: this.error,
                didReachSteadyState: !didAssignmentsChange
            };

            if (didAssignmentsChange === false) {
                break;
            }

            this.iterations++;
        }
        return this.iterationLogs[this.iterationLogs.length - 1];
    }
}
