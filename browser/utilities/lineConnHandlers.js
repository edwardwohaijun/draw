import {ARROW_HEIGHT, ARROW_WIDTH, CANVAS_LEFT_MARGIN} from "../constants/constants";

// when a shape is selected, there are 4 arrows facing up/down/left/right from which you can draw a line out. This function return these arrows's position
// todo: it's better to only show these 4 connectors when mouseHover is fired.
export default function lineConnHandlers(bbox){
  return (
      [
        `M ${bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2 - ARROW_WIDTH / 2}, ${bbox.top - 35} h ${ARROW_WIDTH} L ${bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2}, ${bbox.top - 35 - ARROW_HEIGHT} z`,
        `M ${bbox.right - CANVAS_LEFT_MARGIN + 35}, ${bbox.top + bbox.height / 2 - ARROW_WIDTH / 2} v ${ARROW_WIDTH} L ${bbox.right - CANVAS_LEFT_MARGIN + 35 + ARROW_HEIGHT}, ${bbox.top + bbox.height / 2} z`,
        `M ${bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2 - ARROW_WIDTH / 2}, ${bbox.bottom + 35} h ${ARROW_WIDTH} L ${bbox.left - CANVAS_LEFT_MARGIN + bbox.width / 2}, ${bbox.bottom + 35 + ARROW_HEIGHT} z`,
        `M ${bbox.left - CANVAS_LEFT_MARGIN - 35}, ${bbox.top + bbox.height / 2 - ARROW_WIDTH / 2} v ${ARROW_WIDTH} L ${bbox.left - CANVAS_LEFT_MARGIN - 35 - ARROW_HEIGHT}, ${bbox.top + bbox.height / 2} z`
      ])
}
