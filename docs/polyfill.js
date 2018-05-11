window.onload = function() {
 let scripts = {
  "https://unpkg.com/@tensorflow/tfjs": {
   "https://unpkg.com/@tensorflow-models/posenet": {}
  },
  "clmtrackr.js": {},
  "bundle.js": {}
 };

 let rss = document.querySelector("link[rel='alternate'][type='application/rss+xml']");
 // console.log(rss.href);

 // Loads the RSS feed too.
 // scripts[rss.href] = {};

 let loaded = 0;
 function load(scripts) {
  for (let [script, deps] of Object.entries(scripts)) { 
   let el = document.createElement("script");
   el.src = script;
   el.onload = function() {
    // console.log("loading deps");
    // scripts[script] = true;
    load(deps);
    loaded++;
    if (loaded == 4) {
     // setTimeout(main, 1000);

     fetch(rss.href).then((response) => {
       response.text().then((feed) => {
         // console.log(feed);
         main(feed);
       });
     });

     // main();
    }
   }
   document.body.appendChild(el);
  }
 }

 load(scripts);
 // load();
}
 
// console.log("hi");



async function main(feed) {
 let {Document, Selector, Parser} = module;

 // console.log(feed);
 // console.log(Document);
 let rss = await new Parser().parse(feed);
 console.log(rss);

 let camera = document.getElementById("camera");
 let canvas = document.getElementById("canvas");
 let context = canvas.getContext("2d");

 // console.log("starting");

 navigator.getUserMedia({video : true}, (stream) => {
   // console.log("success!");
   var vid = document.getElementById("camera");
   vid.srcObject = stream;
  }, () => {
   console.log("fail!");
  }
  );

 // load the posenet model
 // let network = undefined;
 posenet.load().then((net) => {
   // console.log("loaded! looping!");
   loop2(net);
  });
  
 var ctracker = new clm.tracker();

 // var canvas = document.getElementById("canvas");
 var cc = canvas.getContext("2d");

 let pose = {};
 
 // console.log(camera);
 ctracker.init();
 ctracker.start(camera);
 // setTimeout(() => {
 //  console.log(ctracker.getCurrentPosition());
 // }, 5000);

 // console.log(pose);

 function loop() {
  // console.log("looping");
  requestAnimationFrame(loop);
  // var positions = ctracker.getCurrentPosition();
  // cc.clearRect(0, 0, canvas.width, canvas.height);
  if (ctracker.getCurrentPosition()) {
   // console.log("hi!");
   // ctracker.draw(canvas);
   // console.log(ctracker.getCurrentPosition());
   // console.log(ctracker.getCurrentPosition());
   //begin();
   //for (let [x, y] of ctracker.getCurrentPosition()) {
   // pain(x, y);
   //  dot(x, y);
   //}
   //end();
   // console.log(pose);
   // let features = [..., ...pose.keypoints];
   paint(ctracker.getCurrentPosition(), pose.keypoints);
  }
  // ctracker.draw(canvas);
  // console.log(positions);
  // positions = [[x_0, y_0], [x_1,y_1], ... ]
  // do something with the positions ...
 }

 function loop2(network) {
  // return;
 
  const imageScaleFactor = 0.2;
  const flipHorizontal = false;
  const outputStride = 16;
  // const camera = document.getElementById("camera");

  network.estimateSinglePose(camera, imageScaleFactor, flipHorizontal, outputStride).then((data) => {
    pose = data;
    // console.log(pose);
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
  if (tag.precision && tag.precision < 0.8) {
   return;
  }

  dot(tag.x, tag.y);
 
  let attributes = "";
  if (tag.attributes) {
   attributes = " " + tag.attributes.join(" ");
  }

  context.fillText(`<${tag.label}${attributes}>`, tag.x, tag.y);

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

 function paint(features, body) {

  if (!body) {
   return;
  }

  begin();
  context.font = '20px serif';
  context.fillStyle = 'green';
  context.strokeStyle = 'green';
  context.lineWidth = 0.2;
  context.setLineDash([1, 2]);
  // console.log(features[27]);
  
  let shoulders = [{
    label: "shoulder",
    x: body[5].position.x,
    y: body[5].position.y,
    attributes: ["left"],
    precision: body[5].score
   }, {
    label: "shoulder",
    x: body[6].position.x,
    y: body[6].position.y,
    attributes: ["right"],
    precision: body[6].score
   }
   ];

  // console.log(body[9]);

  let wrists = [{
    label: "wrist",
    x: body[9].position.x,
    y: body[9].position.y,
    attributes: ["left"],
    precision: body[9].score
   }, {
    label: "wrist",
    x: body[10].position.x,
    y: body[10].position.y,
    attributes: ["right"],
    precision: body[10].score
   }
   ];

  let eyebrows = [{
    label: "eyebrow",
    x: features[21][0],
    y: features[21][1],
    attributes: ["right"]
   }, {
    label: "eyebrow",
    x: features[17][0],
    y: features[17][1],
    attributes: ["left"]
   }];
 
  let eyes = [{
    label: "eye",
    x: features[27][0],
    y: features[27][1],
    attributes: ["right"]
   }, {
    label: "eye",
    x: features[32][0],
    y: features[32][1],
    attributes: ["left"]
   }];

  let ears = [{
    label: "ear",
    x: features[1][0],
    y: features[1][1],
    attributes: ["right"]
   }, {
    label: "ear",
    x: features[13][0],
    y: features[13][1],
    attributes: ["left"]
   }];

  let nose = {label: "nose", x: features[62][0], y: features[62][1]};
  let mouth = {label: "mouth", x: features[47][0], y: features[47][1]};
 
  let lips = [{
    label: "lip",
    x: features[60][0],
    y: features[60][1],
    attributes: ["upper"]
   }, {
    label: "lip",
    x: features[57][0],
    y: features[57][1],
    attributes: ["lower"]
   }];

  let chin = {label: "chin", x: features[7][0], y: features[7][1]};

  let face = {
   label: "face", 
   x: (eyes[1].x - eyes[0].x) / 2 + eyes[0].x,
   y: (eyes[0].y + eyes[1].y) / 2 - 100
  };

  let person = {
   label: "person", 
   x: (shoulders[1].x - shoulders[0].x) / 2 + shoulders[0].x,
   y: (shoulders[0].y + shoulders[1].y) / 2 - 100
  };

  //let person = {
  //  label: "person", 
  //  x: face.x, 
  //  y: face.y - 50
  //};

  marker(person);
  marker(face, person);
      
  marker(eyebrows[0], face);
  marker(eyebrows[1], face);

  marker(eyes[0], face);
  marker(eyes[1], face);

  context.drawImage(image, nose.x - 25, nose.y - 25 * image.height / image.width, 50, 50 * image.height / image.width);

  marker(nose, face);
 
  marker(mouth, face);

  marker(lips[0], mouth);
  marker(lips[1], mouth);

  marker(chin, face);
  
  marker(ears[0], face);
  marker(ears[1], face);

  marker(shoulders[0], person);
  marker(shoulders[1], person);

  marker(wrists[0], person);
  marker(wrists[1], person);

  end();
 }

 // paint();

 function logger(face) {
  // document.getElementById("debug").innerHTML = String(face); 
 }

 loop();
}





