import type { CMS, CmsWidgetControlProps } from "decap-cms-core";
import { type ChangeEvent, Component, createElement } from "react";
import { cmsEditorLocale, websiteVisibilityOptions } from "./cms-config";

class WebsiteVisibilityControl extends Component<
  CmsWidgetControlProps<string>
> {
  render() {
    const { value, forID, classNameWrapper, onChange } = this.props;
    const publicationRequested = value === "published";
    return createElement(
      "div",
      {},
      createElement(
        "select",
        {
          id: forID,
          className: classNameWrapper,
          value: value || "draft",
          onChange: (event: ChangeEvent<HTMLSelectElement>) =>
            onChange(event.currentTarget.value),
          style: { width: "100%", padding: "0.75rem" },
        },
        websiteVisibilityOptions.map(({ label, value }) =>
          createElement("option", { key: value, value }, label),
        ),
      ),
      createElement(
        "p",
        {
          role: "status",
          style: {
            margin: "0.75rem 0 0",
            padding: "0.75rem",
            borderLeft: `4px solid ${publicationRequested ? "#2563a6" : "#9a6700"}`,
            background: publicationRequested ? "#eef5ff" : "#fff8df",
            color: "#172033",
          },
        },
        publicationRequested
          ? "Publish this language after checks — save to request publication. Saved to CMS does not mean live: the website updates only after checks and deployment succeed."
          : "Draft — save unfinished content without requesting publication. Visibility changes reach the website only after saving and successful deployment.",
      ),
    );
  }
}

export function registerCmsEditorUi(cms: CMS): void {
  // A distinct locale preserves Decap's full English fallback.
  cms.registerLocale(cmsEditorLocale, {
    editor: {
      editorControlPane: {
        i18n: {
          copyFromLocaleConfirm:
            "Fill in data from %{locale}? All existing content will be overwritten, including Website visibility. Review visibility before saving.",
        },
      },
      editor: {
        onDeleteWithUnsavedChanges:
          "Delete this saved CMS entry and your unsaved changes? Website removal requires a successful deployment.",
        onDeletePublishedEntry:
          "Delete this saved CMS entry? Website removal requires a successful deployment.",
      },
      editorToolbar: {
        publish: "Save",
        publishing: "Saving...",
        published: "Saved to CMS",
        publishNow: "Save changes",
        publishAndCreateNew: "Save and create new",
        publishAndDuplicate: "Save and duplicate",
        deletePublishedEntry: "Delete saved entry",
        changesSaved: "No unsaved changes",
      },
    },
    ui: {
      toast: {
        entrySaved: "Entry saved to CMS",
        entryPublished: "Entry saved to CMS",
        onFailToPersist: "Could not save to CMS: %{details}",
        onFailToPublishEntry: "Could not save to CMS: %{details}",
      },
    },
  });
  cms.registerWidget("website-visibility", WebsiteVisibilityControl);
}
