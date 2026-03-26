try {
  JSON.parse("{'a': 1}");
} catch (e) {
  console.log("With single quotes:", e.message);
}

try {
  JSON.parse("{a: 1}");
} catch (e) {
  console.log("Without quotes on key:", e.message);
}

try {
  JSON.parse("{ }");
  console.log("Empty object with space: OK");
} catch (e) {
  console.log("Empty object with space:", e.message);
}

try {
  JSON.parse("{{}}");
} catch (e) {
  console.log("Double braces:", e.message);
}

try {
  JSON.parse("{\n\"a\": 1}");
  console.log("With newline: OK");
} catch (e) {
  console.log("With newline:", e.message);
}
