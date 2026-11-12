import { useApp } from "../../app/core.js";
import { AssociationTab } from "../../components/AssociationTab.js";

/* === Association page (own nav entry). Same content as the About tab, with its own header. === */
export function AssociationPage() {
  const { setPage } = useApp();
  return React.createElement("div", { className: "animate-in" },
    React.createElement("section", { className: "section" },
      React.createElement("div", { className: "container" },
        React.createElement(AssociationTab, { onFunding: () => { try { sessionStorage.setItem("g2p_about_tab", "funding"); } catch (e) {} setPage("about"); window.scrollTo(0, 0); } }))));
}
