import { useEffect } from "react";
import { FONT_HREF } from "./constants";

/* load fonts once */
export default function useFonts() {
  useEffect(() => {
    if (document.querySelector(`link[href="${FONT_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_HREF;
    document.head.appendChild(link);
  }, []);
}