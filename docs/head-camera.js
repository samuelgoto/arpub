AFRAME.registerComponent("head-camera", {
  init: function () {
    // console.log("Hello, World!");
    // console.log(this);
    // console.log(this.el);
    this.video = document.createElement("video");
    this.video.setAttribute("width", "400");
    this.video.setAttribute("height", "300");
    this.video.setAttribute("autoplay", "true");
    this.video.setAttribute("loop", "true");
    this.video.setAttribute("style", "display: none;");
    // let canvas = document.createElement("video");
    // video.setAttribute("width", "400");
    // video.setAttribute("height", "300");
    // video.setAttribute("autoplay", "true");
    // video.setAttribute("loop", "true");
    // video.setAttribute("style", "float: left; display: none;");
    this.el.appendChild(this.video);
    
    // this.baseline = this.el.getAttribute("position");

    main.bind(this)();
  }
});

function main() {
 // let video = document.getElementById("video");

 let camera = this.el;
 let video = this.video;
 let baseline = this.el.getAttribute("position").clone();

 // console.log(baseline);

 navigator.mediaDevices.getUserMedia({video : true}).then((stream) => {
   video.srcObject = stream;
   // console.log("success");
  }).catch(() => {
    alert("failed to load the camera");
    // console.log("fail");
  });

 // return;

 var ctracker = new clm.tracker();
 ctracker.init();
 ctracker.start(video);

 // let canvas = document.getElementById("canvas");
 // let context = canvas.getContext("2d");

 let warmup = [];
 let origin = {nose: {x: 0, y: 0}, z: 0};

 function loop() {
  requestAnimationFrame(loop);
  var positions = ctracker.getCurrentPosition();
  // positions = [[x_0, y_0], [x_1,y_1], ... ]
  // do something with the positions ...
  // console.log(positions);
  if (!positions) {
   return;
  }
  let nose = positions[37];
  let distance = ([x0, y0], [x1, y1]) => Math.sqrt((x1 - x0) ** 2 + (y1 - y0) ** 2);
  let z = distance(positions[27], positions[32]);
  if (warmup.length < 50) {
   // console.log("warming up");
   warmup.push({nose: {x: nose[0], y: nose[1]}, z: z});
  } else if (warmup.length == 50) {
   // console.log("warmed up");
   warmup.push({nose: {x: nose[0], y: nose[1]}, z: z});
   for (let {nose, z} of warmup) {
    origin.nose.x += nose.x;
    origin.nose.y += nose.y;
    origin.z += z;
   }
   origin.nose.x /= warmup.length;
   origin.nose.y /= warmup.length;
   origin.z /= warmup.length;
   // console.log(origin);
  } else {
   // console.log(z);
   let x = - Math.round(nose[0] - origin.nose.x) / 100;
   let y = - Math.round(nose[1] - origin.nose.y) / 100;
   // console.log(y);
   let zoom = (origin.z - z) / 50;
   // console.log(baseline);
   camera.setAttribute("position", {
     x: baseline.x + x, 
     y: baseline.y + y, 
     z: baseline.z + zoom
   });
  }
  // context.clearRect(0, 0, canvas.width, canvas.height);
  // ctracker.draw(canvas);
 }
 loop();
}

// main();
