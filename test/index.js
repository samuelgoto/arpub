const Assert = require("assert");
const HtmlDom = require('htmldom');
const fs = require('fs');
const Parser = require('rss-parser');

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


    let parser = new Parser({
      customFields: {
       "item": ["ar:artifact"]
      }
     });

    var content = fs.readFileSync('./test/example.xml', 'utf8');
    parser.parseString(content).then(rss => {
      for (let item of rss.items) {
       let artifact = item["ar:artifact"];
       let selector = artifact["ar:anchor"][0]["$"].selector;
       let asset = artifact["ar:asset"][0]["$"].src;

       let matches = dom.$(selector);
       console.log(`Add to ${selector}: ${asset}`);
       console.log(matches);
      }
    });

    return;

  });
});
