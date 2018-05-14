const HtmlDom = require('htmldom');
const RssParser = require('rss-parser');

class Document {
 constructor() {
  this.dom = new HtmlDom(`
      <person>
        <shoulder right />
        <shoulder left />
        <wrist right />
        <wrist left />
        <face>
          <eye right />
          <eye left />
          <eyebrow right />
          <eyebrow left />
          <ear right />
          <ear left />
          <nose />
          <mouth>
            <lip upper />
            <lip bottom />
          </mouth>
          <chin />
        </face>
      </person>
  `);  
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
    let resource = {};

    // console.log(asset);
    asset.parent = match;
    match.children.push(asset);

    //if (asset.attributes.type) {
    // resource.type = asset.attributes.type;
    //}
    //if (asset.attributes.src) {
    // resource.src = asset.attributes.src;
    //}
    //if (asset.children && 
    //    asset.children.length > 0 &&
    //    asset.children[0].value) {
    // resource.value = asset.children[0].value.trim()
    //}
    // match.asset = resource;
     // }
   }
  }
 }

 static from(feed) {
  const doc = new Document();
  const artifact = feed.items[0]["ar:artifact"];

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
  code.apply(doc);

  return doc;
 }

 querySelectorAll(selector) {
  return this.dom.$(selector);
 }

 querySelector(selector) {
  return this.dom.$(selector)[0];
 }

 load(body, face) {
  if (!body || !face) {
   return null;
  }

  function apply(el, shape, body) {
   el.x = body ? shape.position.x : shape[0];
   el.y = body ? shape.position.y : shape[1];
   el.score = body ? shape.score : undefined;
  }

  // positions coming from the tensorflow vision.                                                                          
  apply(this.querySelector("shoulder[right]"), body[6], true);
  apply(this.querySelector("shoulder[left]"), body[5], true);

  apply(this.querySelector("wrist[right]"), body[10], true);
  apply(this.querySelector("wrist[left]"), body[9], true);

  // positions coming from clmtracker.                                                                   
  apply(this.querySelector("eyebrow[right]"), face[21]);
  apply(this.querySelector("eyebrow[left]"), face[17]);

  apply(this.querySelector("eye[right]"), face[27]);
  apply(this.querySelector("eye[left]"), face[32]);

  apply(this.querySelector("ear[right]"), face[1]);
  apply(this.querySelector("ear[left]"), face[13]);

  apply(this.querySelector("nose"), face[62]);
  apply(this.querySelector("mouth"), face[47]);

  apply(this.querySelector("lip[upper]"), face[60]);
  apply(this.querySelector("lip[bottom]"), face[57]);

  apply(this.querySelector("chin"), face[7]);

  let eyes = this.querySelectorAll("eye");
  apply(this.querySelector("face"), [
    (eyes[1].x - eyes[0].x) / 2 + eyes[0].x,
    (eyes[0].y + eyes[1].y) / 2 - 100
  ]);

  let shoulders = this.querySelectorAll("shoulder");
  apply(this.querySelector("person"), [
     (shoulders[1].x - shoulders[0].x) / 2 + shoulders[0].x,
     (shoulders[0].y + shoulders[1].y) / 2 - 100
   ]);

  return this;
 }

 static xml(node, level) {
  // console.log(node);

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

 toString() {
  return Document.xml(this.dom.dom, 0);
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

   continue;

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