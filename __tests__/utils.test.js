const IGN_REGEX = /^[a-zA-Z0-9]{2,32}\.\d{4}$/;

describe("IGN format", () => {
  test("accepts valid IGN", () => {
    expect("zeo.1234").toMatch(IGN_REGEX);
    expect("Zeo123.9999").toMatch(IGN_REGEX);
  });

  test("rejects missing dot or digits", () => {
    expect("zeo1234").not.toMatch(IGN_REGEX);
    expect("zeo.123").not.toMatch(IGN_REGEX);
    expect("zeo.12345").not.toMatch(IGN_REGEX);
  });

  test("rejects too short or long names", () => {
    expect("z.1234").not.toMatch(IGN_REGEX); // 1-char still matches
    const tooLong = "a".repeat(33) + ".1234";
    expect(tooLong).not.toMatch(IGN_REGEX);
  });
});

