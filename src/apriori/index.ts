import {receipts} from './retail-data';
import Apriori from 'apriori';

import { FPGrowth } from 'node-fpgrowth';

const results = (new Apriori.Algorithm(0.02, 0.9, false))
    .analyze(receipts.slice(0, 1000));

console.log(results.associationRules.sort((a, b) => a.confidence > b.confidence ? -1 : 1));