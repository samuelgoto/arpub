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
                 "_": "\n                foo bar\n              ",
                  "$":{"type":"text/html"}
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
          <asset type="image/png" src="node.png"></asset>
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

  it.only("End to end", async function() {
    let parser = new Parser();
    var content = fs.readFileSync('./test/example.xml', 'utf8');
    let result = await parser.parse(content);
    let artifact = result.items[0]["ar:artifact"];
    
    function walk(node) {
     let result = "";
     for (let [key, value] of Object.entries(node)) {
      if (key == "_" || key == "$") {
       continue;
      }
      // console.log(`key: ${key}`);
      // console.log(`value: ${JSON.stringify(value)} `);
      
      let attributes = "";
      if (node[key][0]["$"]) {
       attributes = " " + Object.entries(node[key][0]["$"]).map(([key, value]) => `${key}="${value}"`).join(" ");
      }
      
      result += `<${key}${attributes}>`;
      if (node[key][0]["_"]) {
       result += `${node[key][0]["_"]}`;
      }
      for (let child of value) {
       // console.log(`child: ${JSON.stringify(child)}`);
       result += walk(child);
      }
      result += `</${key}>`;
     }
     return result;
    }

    // console.log(artifact);
    // console.log(JSON.stringify(artifact, 0, 2));
    // console.log(walk(artifact));
    let code = new Selector(walk(artifact));

    let doc = new Document();
    
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
