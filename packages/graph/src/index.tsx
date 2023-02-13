import ReactDOM from "react-dom/client";
import App from "@vityaz-graph/lib/src/App";
import Main from "./main";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import "./assets/font-awesome.css";
import "./assets/vis-timeline-graph2d.css";
import { containerClassName } from "@vityaz-graph/lib/src/utils";

const instancesElements = document.getElementsByClassName(containerClassName);

Array.from(instancesElements).forEach((element) => {
  ReactDOM.createRoot(element).render(
    <App>
      <Main rootElement={element as HTMLElement} />
    </App>
  );
});
