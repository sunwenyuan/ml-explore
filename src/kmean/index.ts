import { example_2d3k, example_3d3k, example_2dnk } from "./data";
import { KMeans } from "./kmean";
import { KMeansAutoSolver } from "./kmeans-autosolver";

// console.log('Solving example: 2d data with 3 clusters:');
// console.log('=============================================\n');
// console.log('Solution for 2d data with 3 clusters:');
// console.log('--------------------------------------');
// const ex_1_solver = new KMeans(3, example_2d3k);
// const ex_1_centroids = ex_1_solver.solve();
// ex_1_solver.iterationLogs.forEach(log => console.log(log));
// console.log('');

// console.log('Solving example: 3d data with 3 clusters:');
// console.log('=============================================\n');
// console.log('Solution for 3d data with 3 clusters:');
// console.log('--------------------------------------');
// const ex_2_solver = new KMeans(3, example_3d3k);
// const ex_2_centroids = ex_2_solver.solve();
// ex_2_solver.iterationLogs.forEach(log => console.log(log));
// console.log('');

console.log('Solving example: 2d data with unknown clusters:');
console.log('=============================================\n');
console.log('Solution for 2d data with unknown clusters:');
console.log('--------------------------------------');
const ex_3_solver = new KMeansAutoSolver(1, 5, 5, example_2dnk);
const ex_3_solution = ex_3_solver.solve();
console.log(ex_3_solution);