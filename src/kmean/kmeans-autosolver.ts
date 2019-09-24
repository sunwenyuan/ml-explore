import { KMeans } from "./kmean";

export class KMeansAutoSolver {
    best = null;
    log = [];

    constructor(
        public kMin = 1,
        public kMax = 5,
        public maxTrials = 5,
        public data: number[][]
    ) {
        this.reset();
    }

    reset() {
        this.best = null;
        this.log = [];
    }

    solve(maxIterations = 1000) {
        for (let k = this.kMin; k < this.kMax; k++) {
            for (let currentTrial = 0; currentTrial < this.maxTrials; currentTrial++) {
                const solver = new KMeans(k, this.data);
                const solution = Object.assign({}, solver.solve(maxIterations), { k, currentTrial });
                this.log.push(solution);
                if (this.best === null || solution.error < this.best.error) {
                    this.best = solution;
                }
            }
        }
        return this.best;
    }
}