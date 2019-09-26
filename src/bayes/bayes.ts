export const simpleTokenizer = (str: string) => str.toLocaleUpperCase()
    .replace(/[^\w\d]/g, ' ')
    .split(' ')
    .filter(word => word.length > 3)
    .filter((word, index, arr) => arr.indexOf(word, index + 1) === -1);

interface IDatabase {
    labels: ILabels;
    tokens: ITokens;
}

interface ILabels {
    [index: string]: number;
}

interface ITokens {
    [index: string]: ILabels;
}

interface IProbabilityResult {
    label: string;
    probability: number;
}

interface IPredictResult {
    label: string;
    probability: number;
    probabilities: IProbabilityResult[];
}

export class BayesClassifier {
    database: IDatabase;
    tokenizer: (str: string) => string[];

    constructor(tokenizer = null) {
        this.database = {
            labels: {},
            tokens: {}
        };
        this.tokenizer = (tokenizer !== null) ? tokenizer : simpleTokenizer;
    }

    train(label: string, text: string) {
        this.incrementLabelDocumentCount(label);
        this.tokenizer(text).forEach(token => this.incrementTokenCount(token, label));
    }

    incrementLabelDocumentCount(label: string) {
        this.database.labels[label] = this.getLabelDocumentCount(label) + 1;
    }

    getLabelDocumentCount(label: string = null) {
        if (label) {
            return this.database.labels[label] || 0;
        }
        else {
            return Object.values(this.database.labels).reduce((sum, count) => sum + count, 0);
        }
    }

    incrementTokenCount(token: string, label: string) {
        if (typeof this.database.tokens[token] === 'undefined') {
            this.database.tokens[token] = {};
        }
        this.database.tokens[token][label] = this.getTokenCount(token, label) + 1;
    }

    getTokenCount(token: string, label?: string) {
        if (label) {
            return (this.database.tokens[token] || {})[label] || 0;
        }
        else {
            return Object.values(this.database.tokens[token] || {}).reduce((sum, count) => sum + count, 0);
        }
    }

    predict(text: string) {
        const probabilities = this.calculateAllLabelProbabilities(text);
        const best = probabilities[0];
        return {
            label: best.label,
            probability: best.probability,
            probabilities
        };
    }

    calculateAllLabelProbabilities(text: string): IProbabilityResult[] {
        const tokens = this.tokenizer(text);
        return this.getAllLabels().map(label => ({
            label,
            probability: this.calculateLabelProbability(label, tokens)
        })).sort((a, b) => a.probability > b.probability ? -1 : 1);
    }

    getAllLabels(): string[] {
        return Object.keys(this.database.labels);
    }

    calculateLabelProbability(label: string, tokens: string[]): number {
        const probLabel = 1 / this.getAllLabels().length;
        const epsilon = 0.15;
        const tokenScores = tokens.map(token => this.calculateTokenScore(token, label))
            .filter(score => Math.abs(probLabel - score) > epsilon);

        const logSum = tokenScores.reduce((sum, score) => sum + (Math.log(1 - score) - Math.log(score)), 0);
        const probability = 1 / (1 + Math.exp(logSum));
        return probability;
    }

    calculateTokenScore(token: string, label: string): number {
        const rareTokenWeight = 3;
        const totalDocumentCount = this.getLabelDocumentCount();
        const labelDocumentCount = this.getLabelDocumentCount(label);
        const notLabelDocumentCount = totalDocumentCount - labelDocumentCount;

        const probLabel = 1 / this.getAllLabels().length;
        const probNotLabel = 1 - probLabel;

        const tokenLabelCount = this.getTokenCount(token, label);
        const tokenTotalCount = this.getTokenCount(token);

        const tokenNotLabelCount = tokenTotalCount - tokenLabelCount;

        const probTokenGivenLabel = tokenLabelCount / labelDocumentCount;
        const probTokenGivenNotLabel = tokenNotLabelCount / notLabelDocumentCount;
        const probTokenLabelSupport = probTokenGivenLabel * probLabel;
        const probTokenNotLabelSupport = probTokenGivenNotLabel * probNotLabel;

        const rawWordScore = (probTokenLabelSupport) / (probTokenLabelSupport + probTokenNotLabelSupport);

        const s = rareTokenWeight;
        const n = tokenTotalCount;
        const adjustedTokenScore = ((s * probLabel) + (n * (rawWordScore || probLabel))) / (s + n);

        return adjustedTokenScore;
    }
}
