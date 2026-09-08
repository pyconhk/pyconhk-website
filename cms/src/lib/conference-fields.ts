type Field = Record<string, unknown>;

function text(name: string, label: string, widget = "string"): Field {
  return { name, label, widget, required: false, i18n: true };
}

function shared(name: string, label: string, widget = "string"): Field {
  return { ...text(name, label, widget), i18n: "duplicate" };
}

function list(name: string, label: string, fields?: Field[]): Field {
  return {
    name,
    label,
    widget: "list",
    required: false,
    default: [],
    i18n: true,
    ...(fields
      ? {
          fields: [
            {
              ...text("id", "Shared item ID"),
              hint: "Stable lowercase ID, for example hkpug. Keep identical IDs and order in all six languages; the publish check enforces this.",
            },
            ...fields,
          ],
        }
      : { field: text("item", "Text", "text") }),
  };
}

function section(name: string, label: string, fields: Field[]): Field {
  return {
    name,
    label,
    widget: "object",
    collapsed: true,
    i18n: true,
    fields: [
      {
        name: "status",
        label: "Public visibility",
        widget: "select",
        options: ["draft", "published"],
        default: "draft",
        i18n: "duplicate",
        hint: "Publish only approved facts. All six translations must be ready. Draft sections appear as coming soon on the website.",
      },
      ...fields,
    ],
  };
}

export function createConferenceFields(): Field[] {
  return [
    { name: "slug", widget: "hidden", default: "settings", i18n: "duplicate" },
    section("event", "Conference identity", [
      text("title", "Title"),
      text("theme", "Theme"),
      text("datesLabel", "Confirmed dates"),
      shared("startDate", "Start date (YYYY-MM-DD)"),
      shared("endDate", "End date (YYYY-MM-DD)"),
    ]),
    section("tickets", "Tickets", [
      {
        ...shared("url", "Ticket registration URL"),
        hint: "HTTPS ticket provider link. Do not use the CFP submission URL.",
      },
      text("label", "Button label"),
      text("description", "Ticket information", "text"),
    ]),
    section("venue", "Venue and access", [
      text("title", "Venue name"),
      text("address", "Address", "text"),
      text("description", "Venue information", "text"),
      text("directions", "Directions and accessibility", "text"),
      text("wifi", "Public Wi-Fi guidance", "text"),
      shared("mapImage", "Map image", "image"),
      shared("mapUrl", "Map URL"),
    ]),
    section("catering", "Catering", [
      text("intro", "Introduction", "text"),
      list("items", "Meal and dietary guidance"),
    ]),
    section("sprint", "Development sprint", [
      text("intro", "Introduction", "text"),
      shared("date", "Date (YYYY-MM-DD)"),
      text("location", "Location"),
      shared("registrationUrl", "Registration URL"),
      list("items", "Preparation and participation guidance"),
    ]),
    section("qa", "Questions and answers", [
      list("items", "Questions", [
        text("question", "Question"),
        text("answer", "Answer", "text"),
      ]),
    ]),
    section("sponsors", "Confirmed sponsors", [
      list("items", "Sponsors", [
        text("name", "Name"),
        text("tier", "Sponsorship tier"),
        text("logo", "Logo", "image"),
        text("url", "Website URL"),
        text("description", "Description", "text"),
      ]),
    ]),
    section("sponsorship", "Sponsorship opportunities", [
      list("intro", "Introduction paragraphs"),
      list("benefits", "Benefits", [
        text("title", "Title"),
        text("description", "Description", "text"),
      ]),
      list("plans", "Sponsorship plans", [
        text("name", "Plan name"),
        text("tier", "Tier"),
        text("fee", "Fee"),
        text("maxSlots", "Available places"),
        list("features", "Features", [
          text("label", "Benefit"),
          text("value", "Details", "text"),
        ]),
      ]),
    ]),
    section("patrons", "Confirmed patrons", [
      list("items", "Patrons", [text("name", "Name")]),
    ]),
    section("organizations", "Organizers and supporting organizations", [
      list("items", "Organizations", [
        text("name", "Name"),
        {
          name: "kind",
          label: "Relationship",
          widget: "select",
          options: ["organizer", "supporter"],
          default: "supporter",
          i18n: true,
        },
        text("logo", "Logo", "image"),
        text("url", "Website URL"),
        text("description", "Description", "text"),
      ]),
    ]),
    section("people", "Confirmed team and volunteers", [
      list("items", "People", [
        text("name", "Name"),
        text("role", "Role"),
        text("image", "Photo", "image"),
        text("url", "Public profile URL"),
      ]),
    ]),
    section("about", "About the conference", [
      list("paragraphs", "Paragraphs"),
    ]),
  ];
}
