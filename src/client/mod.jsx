import dashboard from "./dashboard.jsx";
import widget from "./widget.jsx";
import { render } from "preact";

const pages = { dashboard, widget };

const stateElement = document.querySelector("#initial-state");
const initialState = stateElement ? JSON.parse(stateElement.textContent) : {};

function App() {
  const Page = pages[initialState.page];

  return <Page state={initialState} />;
}

render(<App />, document.querySelector("body"));
