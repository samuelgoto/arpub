const Assert = require("assert");
const fs = require("fs");
const {Document, Selector, Parser} = require("../index.js");

describe("Doc tests", function(done) {
  it("Parses RSS", async function() {
    let parser = new Parser();
    var content = fs.readFileSync('./test/example.xml', 'utf8');
    let result = await parser.parse(content);
    assertThat(result).equals({
      "title": "Welcome to my AR feed!",
      "description": "Awesome AR tests!",
      "link": "http://sgo.to",
      "items": [{
        "title": 'My first AR artifact!',
        "link": 'http://blog.sgo.to/2018/05/02/my-first-ar-artifact.html',
        "ar:artifact": {
          "ar:anchor": [{
            "selector": "person[gender='male'] eye[right]"
          }],
          "ar:asset": [{
            "src": "model.gltf"
          }]
        },
        content: 'Really simple AR artifact!',
        contentSnippet: 'Really simple AR artifact!'
      }]
     });
  });

  it("Object Model", function() {
    let doc = new Document();
    let code = new Selector(`
      <person>
        <eye right>
          <asset type="text/html">
            hello world
          </asset>
        </eye>
      </person>
    `);

    code.apply(doc);

    assertThat(doc.querySelector("eye[right]").asset).equals({
      type: "text/html",
      value: "hello world"
     });
  });

  it("Nose", function() {
    let doc = new Document();
    let code = new Selector(`
        <nose>
          <asset type="text/html">
            foo bar
          </asset>
        </nose>
    `);

    code.apply(doc);

    assertThat(doc.querySelector("nose").asset).equals({
      type: "text/html",
      value: "foo bar"
     });
  });

  function assertThat(thiz) {
   return {
    equals(that) {
     Assert.deepEqual(thiz, that);
    }
   }
  }
});
