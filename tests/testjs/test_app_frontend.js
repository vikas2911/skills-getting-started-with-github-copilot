const { JSDOM } = require("jsdom");

function loadAppModule() {
  const dom = new JSDOM(`<!doctype html>
    <html>
      <body>
        <div id="activities-list"></div>
        <select id="activity"></select>
        <form id="signup-form">
          <input id="email" />
        </form>
        <div id="message" class="hidden"></div>
      </body>
    </html>`, { url: "http://localhost" });

  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      "Chess Club": {
        description: "Learn strategies",
        schedule: "Fridays",
        max_participants: 12,
        participants: ["student@example.com"],
      },
    }),
  });

  const scriptPath = require.resolve("../../src/static/app.js");
  delete require.cache[scriptPath];
  require(scriptPath);

  return { window, dom };
}

describe("frontend app behavior", () => {
  test("renders activities and populates the select dropdown", async () => {
    const { window } = loadAppModule();

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(window.document.getElementById("activities-list").children.length).toBe(1);
    expect(window.document.getElementById("activity").options.length).toBe(2);
    expect(window.document.getElementById("activity").options[1].text).toBe("Chess Club");
  });

  test("submitting signup form updates the message area", async () => {
    const { window } = loadAppModule();
    const form = window.document.getElementById("signup-form");
    const emailInput = window.document.getElementById("email");
    const activitySelect = window.document.getElementById("activity");

    emailInput.value = "new@example.com";
    activitySelect.value = "Chess Club";

    form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
    await new Promise((resolve) => setTimeout(resolve, 0));

    const message = window.document.getElementById("message");
    expect(message.textContent).toContain("Signed up");
  });
});
