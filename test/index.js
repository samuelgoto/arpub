const Assert = require("assert");
const HtmlDom = require('htmldom');

describe("Doc tests", function(done) {
  it("Simple text", function() {
    let dom = new HtmlDom(`
  <person gender="male">
    <face>
      <eye right>
      <eye left>
    </face>
  </person>
  `);

    console.log(dom.$("person[gender='male'] eye[right]"));
  });
});
