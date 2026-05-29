import { render } from "preact";
import dashboard from "./dashboard.jsx";
import widget from "./widget.jsx";

const pages = { dashboard, widget };
const init = JSON.parse(
  document.querySelector("#initial-state")?.textContent ?? {},
);

function App() {
  const Page = pages[init.page];
  return <Page state={init.state} />;
}

render(<App />, document.querySelector("body"));
