const HtmlDom = require('htmldom');
const RssParser = require('rss-parser');

class Document {
 constructor(markup) {
  this.dom = new HtmlDom(`
      <person>
        <shoulder right />
        <shoulder left />
        <face>
          <eye right />
          <eye left />
          <eyebrow right />
          <eyebrow left />
          <nose />
          <mouth>
            <lip upper />
            <lip bottom />
          </mouth>
        </face>
      </person>
  `);  
 }

 static xml(node, level) {
  let result = [];
  let attributes = "";
  if (node.attributes) {
   attributes = " " + Object.entries(node.attributes).map(([key, value]) => {
     if (value == null) {
      return `${key}`
     }
     return `${key}=${value}`
    }).join(" ");
  }

  if (node.type == "tag") {
   result.push(`${"  ".repeat(level)}<${node.name}${attributes}>`);
  }

  if (node.asset) {
   result.push(`${"  ".repeat(level)}[${node.asset.value}]`);
  }

  for (let child of node.children || []) {
   if (child.type == "tag") {
    result.push(Document.xml(child, level + 1));
   }
  }
  if (node.type == "tag") {
   result.push(`${"  ".repeat(level)}</${node.name}>`);
  }
  return result.join("\n");
 }

 apply(code) {
  let doc = this;
  let assets = code.$("asset");
  let selector = "";

  for (let i = 0; i < assets.length; i++) {
   let asset = assets[i];

   let parent = asset.parent;
   while (parent && parent.name) {
    let attributes = Object.entries(parent.attributes).map(([key, value]) => {
      if (value == null) {
       return `[${key}]`
      }
      return `[${key}=${value}]`
     }).join("");
    // console.log(`${parent.name}${attributes}`);                                                                         
    // console.log(parent);                                                                                                

    selector = `${parent.name}${attributes} ${selector}`;

    parent = parent.parent;
   }

   // console.log(selector);                                                                                               

   // console.log(doc.$(selector));                                                                                        
   let matches = doc.querySelectorAll(selector);
   for (let i = 0; i < matches.length; i++) {
    let match = matches[i];
    // console.log(match);                                                                                                 
    match.asset = {
     type: asset.attributes.type,
     value: asset.children[0].value.trim()
    }
   }
  }
 }

 querySelectorAll(selector) {
  return this.dom.$(selector);
 }

 querySelector(selector) {
  return this.dom.$(selector)[0];
 }

 toString() {
  return xml(this.dom.dom, 0);
 }
}

class Selector {
 constructor(code) {
  this.sel = new HtmlDom(code);
 }
 apply(doc) {
  doc.apply(this.sel);
  return this;
 }
}

class Parser {
 async parse(content) {
  let parser = new RssParser({
    customFields: {
     "item": ["ar:artifact"]
    }
   });

  let rss = await parser.parseString(content);
  for (let item of rss.items) {
   let artifact = item["ar:artifact"];
   let anchor = artifact["ar:anchor"][0];
   let attributes = anchor["$"];
   for (let [key, value] of Object.entries(attributes)) {
    anchor[key] = value;
   }
   delete anchor["$"];
   // let selector = artifact["ar:anchor"][0]["$"].selector;
   let asset = artifact["ar:asset"][0];
   attributes = asset["$"];
   for (let [key, value] of Object.entries(attributes)) {
    asset[key] = value;
   }
   delete asset["$"];

   // let matches = dom.$(selector);                                                                                     
   // console.log(`Add to ${selector}: ${asset}`);                                                                       
   // console.log(matches);                                                                                              
  }
  return rss;
 }
}

module.exports = {
 Document: Document,
 Selector: Selector,
 Parser: Parser
}