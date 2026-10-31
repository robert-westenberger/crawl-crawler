const POPUP_WIDTH_PX = 240;
const POPUP_HEIGHT_PX = 120;

export function Popup() {
  return (
    <div
      style={{
        boxSizing: "border-box",
        width: POPUP_WIDTH_PX,
        height: POPUP_HEIGHT_PX,
        margin: 0,
      }}
    >
      Hello world
    </div>
  );
}
