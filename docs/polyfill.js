window.onload = function() {
 let scripts = {
  "https://unpkg.com/@tensorflow/tfjs": {
   "https://unpkg.com/@tensorflow-models/posenet": {}
  },
  "clmtrackr.js": {},
  "bundle.js": {}
 };

 let rss = document.querySelector("link[rel='alternate'][type='application/rss+xml']");

 let loaded = 0;
 function load(scripts) {
  for (let [script, deps] of Object.entries(scripts)) { 
   let el = document.createElement("script");
   el.src = script;
   el.onload = function() {
    load(deps);
    loaded++;
    if (loaded == 4) {
     fetch(rss.href).then((response) => {
       response.text().then((feed) => {
         main(feed);
       });
     });
    }
   }
   document.body.appendChild(el);
  }
 }

 load(scripts);
}
 
async function main(feed) {
 let {Document, Selector, Parser} = module;

 let rss = await new Parser().parse(feed);
 let doc = Document.from(rss);
 // console.log(doc);

 let camera = document.getElementById("camera");
 let canvas = document.getElementById("canvas");
 let context = canvas.getContext("2d");

 navigator.getUserMedia({video : true}, (stream) => {
   var vid = document.getElementById("camera");
   vid.srcObject = stream;
  }, () => {
   console.log("fail!");
  }
  );

 // load the posenet model
 // let network = undefined;
 posenet.load().then((net) => {
   loop2(net);
  });
  
 var ctracker = new clm.tracker();

 var cc = canvas.getContext("2d");
 let pose = {};
 
 ctracker.init();
 ctracker.start(camera);

 function loop() {
  requestAnimationFrame(loop);
  paint(doc.position(pose.keypoints, 
                    ctracker.getCurrentPosition()));
 }

 function loop2(network) {
  const imageScaleFactor = 0.2;
  const flipHorizontal = false;
  const outputStride = 16;
  network.estimateSinglePose(camera, imageScaleFactor, flipHorizontal, outputStride).then((data) => {
    pose = data;
   });
  setTimeout(loop2.bind(this, network), 1000);
 }

 function begin() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.beginPath();
 }
 function dot(x, y) {
  context.moveTo(x, y);
  context.arc(x, y, 2, 0, 2 * Math.PI, false);
 }
 function end() {
  context.closePath();
  context.fillStyle = 'green';
  context.fill();
 }

 function marker(tag, opt_connect) {
  if (tag.score && tag.score < 0.8) {
   return;
  }

  dot(tag.x, tag.y);
 
  let attributes = "";
  if (Object.entries(tag.attributes).length > 0) {
   attributes = " " + Object.entries(tag.attributes).map((key, value) => {
     if (!value) {
      return `${key}`;
     }
     return `${key}=${value}`;
   }).join(" ");
  }

  context.fillText(`<${tag.name}${attributes}>`, tag.x, tag.y);

  if (opt_connect) {
   context.moveTo(opt_connect.x, opt_connect.y);
   context.lineTo(tag.x, tag.y);
   context.stroke();
  }
 }

 let image = new Image();
 // image.style = "width: 100px, height: 100px";
 // image.width = "100px";
 image.src = "http://www.stickpng.com/assets/images/580b57fbd9996e24bc43bed5.png";

 function paint(doc) {
  if (!doc) {
   return;
  }

  begin();
  context.font = '20px serif';
  context.fillStyle = 'green';
  context.strokeStyle = 'green';
  context.lineWidth = 0.2;
  context.setLineDash([1, 2]);

  let person = doc.querySelector("person");
  marker(person);
  marker(doc.querySelector("face"), doc.querySelector("person"));
      
  let face = doc.querySelector("face");

  marker(doc.querySelector("eyebrow[left]"), face);
  marker(doc.querySelector("eyebrow[right]"), face);

  marker(doc.querySelector("eye[left]"), face);
  marker(doc.querySelector("eye[right]"), face);

  // context.drawImage(image, nose.x - 25, nose.y - 25 * image.height / image.width, 50, 50 * image.height / image.width);

  marker(doc.querySelector("nose"), face);
 
  marker(doc.querySelector("mouth"), face);

  marker(doc.querySelector("lip[upper]"), doc.querySelector("mouth"));
  marker(doc.querySelector("lip[bottom]"), doc.querySelector("mouth"));

  marker(doc.querySelector("chin"), face);
  
  marker(doc.querySelector("ear[left]"), face);
  marker(doc.querySelector("ear[right]"), face);

  marker(doc.querySelector("shoulder[right]"), person);
  marker(doc.querySelector("shoulder[left]"), person);

  marker(doc.querySelector("wrist[right]"), person);
  marker(doc.querySelector("wrist[left]"), person);

  end();
 }

 function logger(face) {
 }

 loop();
}





