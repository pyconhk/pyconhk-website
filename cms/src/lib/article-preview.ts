import type { CMS, PreviewTemplateComponentProps } from "decap-cms-core";
import { type ChangeEvent, Component, createElement, createRef } from "react";
import { postCollectionDefinitions } from "./cms-config";

type PreviewProps = PreviewTemplateComponentProps & {
  year: number;
  appearanceEnabled: boolean;
  // Decap supplies this at runtime but omits it from its published type.
  locale?: string;
};
type Appearance = "system" | "light" | "dark";

class ArticlePreview extends Component<
  PreviewProps,
  { html: string; error: string; appearance: Appearance }
> {
  state = { html: "", error: "", appearance: "system" as Appearance };
  frame = createRef<HTMLIFrameElement>();
  timer?: ReturnType<typeof setTimeout>;
  request?: AbortController;
  media = window.matchMedia("(prefers-color-scheme: dark)");
  scrollPosition = 0;

  componentDidMount() {
    this.media.addEventListener("change", this.applyAppearance);
    this.scheduleRender();
  }

  componentDidUpdate(previous: PreviewProps) {
    if (
      previous.entry.get("data") !== this.props.entry.get("data") ||
      previous.locale !== this.props.locale ||
      previous.getAsset !== this.props.getAsset ||
      previous.isLoadingAsset !== this.props.isLoadingAsset
    ) {
      this.scheduleRender();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
    this.request?.abort();
    this.media.removeEventListener("change", this.applyAppearance);
  }

  applyAppearance = () => {
    const root = this.frame.current?.contentDocument?.documentElement;
    if (root && this.props.appearanceEnabled) {
      root.dataset.conferenceTheme = this.resolvedAppearance;
    }
  };

  get resolvedAppearance() {
    return this.state.appearance === "system"
      ? this.media.matches
        ? "dark"
        : "light"
      : this.state.appearance;
  }

  scheduleRender() {
    clearTimeout(this.timer);
    this.request?.abort();
    this.timer = setTimeout(() => void this.renderArticle(), 200);
  }

  async renderArticle() {
    const controller = new AbortController();
    this.request = controller;
    try {
      const response = await fetch(`/admin/preview/${this.props.year}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: this.props.entry.get("data").toJS(),
          locale: this.props.locale || "en",
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Preview failed (${response.status})`);
      const document = new DOMParser().parseFromString(
        await response.text(),
        "text/html",
      );
      // Article previews need no scripts, including Wrangler's dev live reload.
      for (const script of document.querySelectorAll("script")) script.remove();
      if (this.props.appearanceEnabled) {
        document.documentElement.dataset.conferenceTheme =
          this.resolvedAppearance;
      }
      // Resolve assets after sanitizing Markdown so temporary blob URLs survive.
      // getAsset also covers images uploaded before the entry has been saved.
      for (const img of document.querySelectorAll("img[src]")) {
        const source = img.getAttribute("src");
        if (source) {
          // Decap treats leading-slash public paths as external URLs. Resolve
          // our public media prefix back into its draft media cache first.
          // Decap's published props type says Map; runtime config is plain.
          const config = this.props.config as unknown as {
            public_folder: string;
          };
          const publicFolder = config.public_folder.replace(/\/$/u, "");
          const assetPath = source.startsWith(`${publicFolder}/`)
            ? source.slice(publicFolder.length + 1)
            : source;
          img.setAttribute("src", this.props.getAsset(assetPath).url);
        }
      }
      if (controller.signal.aborted) return;
      this.scrollPosition = this.frame.current?.contentWindow?.scrollY || 0;
      this.setState({
        html: `<!doctype html>${document.documentElement.outerHTML}`,
        error: "",
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        this.setState({
          error: error instanceof Error ? error.message : "Preview failed",
        });
      }
    }
  }

  render() {
    return createElement(
      "div",
      { style: { display: "flex", flexDirection: "column", height: "100vh" } },
      createElement(
        "div",
        {
          style: {
            padding: "12px",
            font: "14px system-ui",
            background: "#fff",
            color: "#172033",
          },
        },
        createElement(
          "span",
          {},
          `Article preview · ${(this.props.locale || "en").toUpperCase()}`,
        ),
        this.props.appearanceEnabled &&
          createElement(
            "label",
            { style: { marginLeft: "16px" } },
            "Appearance ",
            createElement(
              "select",
              {
                "aria-label": "Preview appearance",
                value: this.state.appearance,
                onChange: (event: ChangeEvent<HTMLSelectElement>) =>
                  this.setState(
                    { appearance: event.currentTarget.value as Appearance },
                    this.applyAppearance,
                  ),
              },
              ["system", "light", "dark"].map((mode) =>
                createElement("option", { key: mode, value: mode }, mode),
              ),
            ),
          ),
      ),
      this.state.error &&
        createElement(
          "p",
          { role: "alert" },
          `${this.state.error}. Edit again to retry.`,
        ),
      !this.state.html &&
        !this.state.error &&
        createElement("p", { role: "status" }, "Rendering article…"),
      createElement("iframe", {
        ref: this.frame,
        title: "Article preview",
        sandbox: "allow-same-origin",
        srcDoc: this.state.html,
        style: {
          border: 0,
          flex: 1,
          width: "100%",
          visibility: this.state.error ? "hidden" : "visible",
        },
        onLoad: () => {
          this.applyAppearance();
          this.frame.current?.contentWindow?.scrollTo(0, this.scrollPosition);
          // Keep article navigation inside the editor rather than leaving the preview.
          this.frame.current?.contentDocument?.addEventListener(
            "click",
            (event) => {
              if ((event.target as Element).closest("a"))
                event.preventDefault();
            },
          );
        },
      }),
    );
  }
}

export function registerArticlePreviews(cms: CMS): void {
  cms.registerPreviewStyle("html,body{margin:0}#nc-root{min-height:100vh}", {
    raw: true,
  });
  for (const { name, year, previewAppearance } of postCollectionDefinitions) {
    for (const collection of [name, `${name}_test`]) {
      cms.registerPreviewTemplate(collection, (props) =>
        createElement(ArticlePreview, {
          ...props,
          year,
          appearanceEnabled: previewAppearance,
        }),
      );
    }
  }
}
