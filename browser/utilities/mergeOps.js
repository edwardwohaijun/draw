import {matrixMultiply} from '../utilities/common'

let resolveConflicts = (m1, m2) => {

};

export default function mergeOps(staticData){
  if (!staticData.selected.element) return;

  // update other attribute, like styling related

  let matrices = staticData.opQueue.transform.map(m => m.slice(7, -1).split(' ').map(parseFloat));
  //if (matrices.length === 0) { // just in case. Because the following reduce function's cb needs at least 2 arguments
    //matrices.push([1, 0, 0, 1, 0, 0])
  //}
  matrices.push(staticData.transform.matrix);
  console.log('matrices: ', matrices);

  let newMatrix = matrices.reduce((m1, m2) => (
    matrixMultiply(m1, m2)
  ), [1, 0, 0, 1, 0, 0]);

  staticData.selected.element.setAttribute('transform', `matrix(${newMatrix.join(' ')})`);
  staticData.opQueue.transform.length = 0
};
