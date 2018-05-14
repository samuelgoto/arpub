const Assert = require("assert");
const fs = require("fs");
const {Document, Selector, Parser} = require("../index.js");

describe("Doc tests", function(done) {
  it("Parses RSS", async function() {
    let parser = new Parser();
    var content = fs.readFileSync('./test/example.xml', 'utf8');
    let result = await parser.parse(content);

    // console.log(JSON.stringify(result.items[0]["ar:artifact"], 0, 0));
    assertThat(result).equals({
      "title": "Welcome to my AR feed!",
      "description": "Awesome AR tests!",
      "link": "http://sgo.to",
      "items": [{
        "title": 'My first AR artifact!',
        "link": 'http://blog.sgo.to/2018/05/02/my-first-ar-artifact.html',
        "ar:artifact": {
         "person": [{
           "face":[{
             "nose":[{
               "asset":[{
                 "_": "\n                hello world\n              ",
                  "$":{"type":"image/png", "src": "nose.png"}
               }]
             }]
           }]
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
          <asset type="image/png" src="nose.png"></asset>
        </eye>
      </person>
    `);

    code.apply(doc);

    assertThat(doc.querySelector("eye[right]").children[0].name)
     .equals("asset");
    assertThat(doc.querySelector("eye[right]").children[0].attributes)
     .equals({
       type: "image/png",
       src: "nose.png",
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

    assertThat(doc.querySelector("nose").children[0].name)
     .equals("asset");
    assertThat(doc.querySelector("nose").children[0].attributes)
     .equals({
       type: "text/html",
    });
  });

  it("End to end", async function() {
    var content = fs.readFileSync('./test/example.xml', 'utf8');
    let feed = await new Parser().parse(content);
    let doc = Document.from(feed);

    assertThat(doc.querySelector("nose").children[0].name)
     .equals("asset");
    assertThat(doc.querySelector("nose").children[0].attributes)
     .equals({
       type: "image/png",
        src: "nose.png",
    });
    assertThat(doc.querySelector("nose").children[0].children[0].value.trim())
     .equals("hello world");

  });

  it("Positions", async function() {
    var content = fs.readFileSync('./test/example.xml', 'utf8');
    let feed = await new Parser().parse(content);
    let doc = Document.from(feed);

    // creates fake data.
    let b = (id) => {
     return {position: {x: id, y: id}, score: id}
    };
    let f = (id) => {
     return [id, id]
    };

    let body = [];
    body[5] = b(5);
    body[6] = b(6);
    body[9] = b(9);
    body[10] = b(10);
    
    let face = [];
    face[21] = f(21);
    face[17] = f(17);
    face[27] = f(27);
    face[32] = f(32);
    face[1] = f(1);
    face[13] = f(13);
    face[62] = f(62);
    face[47] = f(47);
    face[60] = f(60);
    face[57] = f(57);
    face[7] = f(7);

    // Applies the position.
    doc.load(body, face);

    // Asserts that the position were set correctly.
    assertThat(doc.querySelector("shoulder[right]")).isAt(6, 6, 6);
    assertThat(doc.querySelector("shoulder[left]")).isAt(5, 5, 5);

    assertThat(doc.querySelector("wrist[right]")).isAt(10, 10, 10);
    assertThat(doc.querySelector("wrist[left]")).isAt(9, 9, 9);

    assertThat(doc.querySelector("eyebrow[right]")).isAt(21, 21);
    assertThat(doc.querySelector("eyebrow[left]")).isAt(17, 17);

    assertThat(doc.querySelector("eye[right]")).isAt(27, 27);
    assertThat(doc.querySelector("eye[left]")).isAt(32, 32);
    
    assertThat(doc.querySelector("ear[right]")).isAt(1, 1);
    assertThat(doc.querySelector("ear[left]")).isAt(13, 13);

    assertThat(doc.querySelector("nose")).isAt(62, 62);
    assertThat(doc.querySelector("mouth")).isAt(47, 47);

    assertThat(doc.querySelector("lip[upper]")).isAt(60, 60);
    assertThat(doc.querySelector("lip[bottom]")).isAt(57, 57);

    assertThat(doc.querySelector("chin")).isAt(7, 7);

    // The face is algorithmically positioned to be between the eyes.
    assertThat(doc.querySelector("face")).isAt(29.5, -70.5);

    // The person is algorithmically positioned to be between the shoulders.
    assertThat(doc.querySelector("person")).isAt(5.5, -94.5);
  });

  function assertThat(thiz) {
   return {
    equals(that) {
     Assert.deepEqual(thiz, that);
    },
    isAt(x, y, score) {
     // console.log(thiz.x);
     Assert.deepEqual(thiz.x, x);
     Assert.deepEqual(thiz.y, y);
     Assert.deepEqual(thiz.score, score);
    }
   }
  }
});
