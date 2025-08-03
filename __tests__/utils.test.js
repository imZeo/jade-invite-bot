const IGN_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9 ]{0,30}[a-zA-Z0-9])?\.\d{4}$/;

function normalizeIGN(input) {
  return input.trim().replace(/\s+/g, " ");
}

describe("IGN format", () => {
  test("accepts valid IGN", () => {
    expect(normalizeIGN("zeo.1234")).toMatch(IGN_REGEX);
    expect(normalizeIGN("Zeo123.9999")).toMatch(IGN_REGEX);
    expect(normalizeIGN("Zeo 123.9999")).toMatch(IGN_REGEX);
    expect(normalizeIGN(" Z e o   1 2 3.1234 ")).toMatch(IGN_REGEX);
  });

  test("rejects missing dot or digits", () => {
    expect(normalizeIGN("zeo1234")).not.toMatch(IGN_REGEX);
    expect(normalizeIGN("zeo.123")).not.toMatch(IGN_REGEX);
    expect(normalizeIGN("zeo.12345")).not.toMatch(IGN_REGEX);
  });

  test("rejects too short or long names", () => {
    const tooLong = normalizeIGN("a".repeat(33) + ".1234");
    expect(tooLong).not.toMatch(IGN_REGEX);
  });

  test("rejects invalid spacing", () => {
    expect(normalizeIGN("zeo. 1234")).not.toMatch(IGN_REGEX);
    expect(normalizeIGN("zeo .1234")).not.toMatch(IGN_REGEX);
  });
});
