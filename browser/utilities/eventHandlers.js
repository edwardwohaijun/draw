import updateHandlersPos from './updateHandlersPos';
import updateTxtPos from './updateTxtPos';

export default function eventHandlers(socket, staticData, createShape, removeShape){
  socket.on('/canvas/set-attribute', data => {
    let ele = document.getElementById(data.id);
    if (!ele) return;

    let isShapeSelected = false; // the shape to be modified is selected
    if (staticData.selected.element && (staticData.selected.element.id === data.id)){
      isShapeSelected = true;
    }
    let isSafeProceed = !isShapeSelected || (isShapeSelected && !staticData.dragging); // even if the shape is selected, but not being dragged, it's safe to proceed with setAttribute

    switch(data.attributeName){
      case 'transform':
          if (isSafeProceed) {
            ele.setAttribute(data.attributeName, data.value); // transform attribute is set on the top-level element
            if (isShapeSelected){
              staticData.transform.matrix = data.value.slice(7, -1).split(' ').map(parseFloat);
              updateHandlersPos(staticData);
            }
          } else { // in this implt, I just ditch the incoming transform, because the shape is still being dragged...
          // In its mouseup, a new transform would send to other peers, replace their local one
          // it's possible to merge all incoming transform and the one currently running. Implement this in next release
            // staticData.opQueue.transform.push(data.value)
          }

          let txtEleID = staticData.attached[data.id].text;
          if (txtEleID){
            updateTxtPos(txtEleID, data.id);
          }
        break;

      case 'd': // only cubic bezier curves have 'd' attribute. Although other custom types also have 'd', they are not allowed to modify its value
        if (isShapeSelected){
          let curves = ele.getElementsByClassName('curved-shape');
          Array.prototype.forEach.call(curves, c => { // there are 2 curves, the thin one is for presentation, the thick hidden one is for interactivity
            c.setAttribute('d', data.value)
          });
          if (isShapeSelected){
            staticData.curve.CP = data.value;
            updateHandlersPos(staticData);
          }
        } else {
          // staticData.opQueue.CP.push(data.value)
        }

        break;

      case 'points': // only polylines have points attributes. You are not allowed to manipulate polylines directly in this impl. But transforming associated shape would change polylines indirectly
        let polyline = document.getElementById(data.id);
        if (polyline){ // this is just the shape container, not the concrete shape
          let lines = polyline.getElementsByClassName('polyline-shape');
          Array.prototype.forEach.call(lines, l => { // there are 2 polylines, ditto
            l.setAttribute('points', data.value)
          })
        }
        break;

      // todo: split line-attribute, text-attribute, and regular shape attribute handlers into 3 different functions.
      default: // other attribute like (styling related, fill/stroke) are set on the wrapped element with 'shape' class
        let shape;
        if (data.attributeName === 'textContent'){
          shape = ele.getElementsByClassName('attached-text');
          if (shape[0]) {
            shape[0].innerText = data.value
          }
        } else {
          shape = ele.getElementsByClassName('shape');
          if (shape[0]){
            shape[0].setAttribute(data.attributeName, data.value);
          }
        }
    }

  });

  socket.on('/canvas/new-shape', data => {
    createShape(null, data)
  });

  socket.on('/canvas/delete-shape', data => {
    removeShape(data.id)
  })

};
