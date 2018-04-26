import {CANVAS_LEFT_MARGIN, CANVAS_TOP_MARGIN, TEXT_ELE_HEIGHT, TEXT_ELE_WIDTH} from "../constants/constants";

// when a shape is transformed, the attached text's position also need transform. In this implt, I just do the translate on text, no scale/rotate.
// when the text element is created for the first time, I also need its position, thus it also get called in double-click evt handler.
// In this case, text element doesn't exist yet, no point to pass its ID.
export default function updateTxtPos(textID, attachedEleID) {
  let matrix = `matrix(1 0 0 1 0 0)`;

  let attachedEle = document.getElementById(attachedEleID);
  if (!attachedEle) return matrix;

  let bbox = attachedEle.getBoundingClientRect(); // bbox.x === bbox.left, bbox.y === bbbox.top, but Safari has no x/y props, thus use left/top instead
  let textPosX = Math.round((bbox.left - CANVAS_LEFT_MARGIN + bbox.width/2)*100)/100;
  let textPosY = Math.round((bbox.top - CANVAS_TOP_MARGIN + bbox.height/2)*100)/100;
  matrix = `matrix(1 0 0 1 ${textPosX - TEXT_ELE_WIDTH/2} ${textPosY - TEXT_ELE_HEIGHT/2})`;

  let txtEle;
  if (textID && (txtEle = document.getElementById(textID))){
    txtEle.setAttribute('transform', matrix);
  }

  return matrix;
};
