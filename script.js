//========================================================================
// Drag and drop image handling
//========================================================================

var fileDrag = document.getElementById("file-drag");
var fileSelect = document.getElementById("file-upload");

// Add event listeners

function fileDragHover(e) {
  // prevent default behaviour
  e.preventDefault();
  e.stopPropagation();

  fileDrag.className = e.type === "dragover" ? "upload-box dragover" : "upload-box";
}

function fileSelectHandler(e) {
  // handle file selecting
  var files = e.target.files || e.dataTransfer.files;
  fileDragHover(e);
  for (var i = 0, f; (f = files[i]); i++) {
    previewFile(f);
  }
}

//========================================================================
// Web page elements for functions to use
//========================================================================

var imagePreview = document.getElementById("image-preview");
var imageDisplay = document.getElementById("image-display");
var uploadCaption = document.getElementById("upload-caption");
var predResult = document.getElementById("pred-result2");
var loader = document.getElementById("loader");
var model = undefined;
var modeldirection = undefined;
var allimageloaded = false;

//========================================================================
// Main button events
//========================================================================


async function initialize() {
  model = await tf.loadGraphModel('jsweights/model.json');
  modeldirection = await tf.loadGraphModel('directionjsweights/model.json');

}

function download() {

  var textFile = null,
    makeTextFile = function (text) {
      var data = new Blob([text], { type: "text/plain" });

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }
      textFile = window.URL.createObjectURL(data);
      return textFile;
    };

  textbox = document.getElementById("pred-result2");
  var link = document.getElementById("downloadlink");

  link.href = makeTextFile(textbox.innerHTML);
  link.style.display = 'block';

  predResult.innerHTML = "";

  allimageloaded = false;

}


function downloadDirection() {

  var textFile = null,
    makeTextFile = function (text) {
      var data = new Blob([text], { type: "text/plain" });

      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile);
      }
      textFile = window.URL.createObjectURL(data);
      return textFile;
    };

  textbox = document.getElementById("pred-result2");
  var link = document.getElementById("downloadlink-direction");

  link.href = makeTextFile(textbox.innerHTML);
  link.style.display = 'block';

  hide(imagePreview);
  hide(imageDisplay);
}

function predictDirection(i) {
  clearImage();

  previewFile(i, function () {
    console.log('Image loaded!');
  });

  setTimeout(async function () {

    console.log(imagePreview);
    if (allimageloaded == true) {
      return;
    }

    let tensorImg = tf.browser.fromPixels(imagePreview).toFloat().expandDims(0);
    prediction = await modeldirection.predict(tensorImg).dataSync();
    predictionArray = Array.from(prediction);     
    //predictionResult = tf.argMax(prediction).dataSync()[0];
    console.log(predictionArray);
    let maximumarr = Math.max.apply(Math, predictionArray);
    let predictionResult = predictionArray.indexOf(maximumarr);
    if (predictionResult === 0) {
      predResult.innerHTML += "back ";

    } else if (predictionResult === 1) {
      predResult.innerHTML += "front ";

    } else if (predictionResult === 2) {
      predResult.innerHTML += "left ";
    }
    else if (predictionResult === 3) {
      predResult.innerHTML += "right ";
    }     

    predResult.innerHTML += "\n"
  }, 1000);

}


function predictDirectionLoop(predictloop) {
  var count = 1;
  var refreshId = setInterval(function () {
    console.log(allimageloaded);
    if (allimageloaded === true) {
      downloadDirection();
      clearInterval(refreshId);
    } else {
      predictDirection(count);
      count++;
    }

  }, 2000);
}

function predictloop() {
  var count = 1;
  var refreshId = setInterval(function () {
    console.log(allimageloaded);
    if (allimageloaded === true) {
      console.log("true lett");
      download();

      clearInterval(refreshId);
      predictDirectionLoop(predictloop)
    } else {
      predict(count);
      count++;
    }

  }, 2000);
}

function predict(i) {
  clearImage();

  previewFile(i, function () {
    console.log('Image loaded!');
  });

  setTimeout(async function () {

    console.log(imagePreview);
    if (allimageloaded == true) {
      return;
    }

    let tensorImg = tf.browser.fromPixels(imagePreview).toFloat().expandDims(0);
    prediction = await model.predict(tensorImg).dataSync();
    predictionArray = Array.from(prediction);        
    for (let j = 0; j < 3; j++) {
      //predictionResult = tf.argMax(prediction).dataSync()[0];
      console.log(predictionArray);
      let maximumarr = Math.max.apply(Math, predictionArray);
      let predictionResult = predictionArray.indexOf(maximumarr);
      if (predictionResult === 0) {
        predResult.innerHTML += "WC ";

      } else if (predictionResult === 1) {
        predResult.innerHTML += "armchair ";

      } else if (predictionResult === 2) {
        predResult.innerHTML += "bathroom-sink ";
      }
      else if (predictionResult === 3) {
        predResult.innerHTML += "bath ";
      }
      else if (predictionResult === 4) {
        predResult.innerHTML += "bed ";
      }
      else if (predictionResult === 5) {
        predResult.innerHTML += "chair ";
      }
      else if (predictionResult === 6) {
        predResult.innerHTML += "cooker ";
      }
      else if (predictionResult === 7) {
        predResult.innerHTML += "door ";
      }
      else if (predictionResult === 8) {
        predResult.innerHTML += "kitchen-sink ";
      }
      else if (predictionResult === 9) {
        predResult.innerHTML += "shower ";
      }
      else if (predictionResult === 10) {
        predResult.innerHTML += "sofa ";
      }
      else if (predictionResult === 11) {
        predResult.innerHTML += "table ";
      }
      else if (predictionResult === 12) {
        predResult.innerHTML += "urinal ";
      }
      predictionArray[predictionResult] = -1000;
    }
    predResult.innerHTML += "\n"
  }, 1000);

}



function clearImage() {

  // remove image sources and hide them
  imagePreview.src = "";
  imageDisplay.src = "";

  hide(imagePreview);
  hide(imageDisplay);
  hide(loader);
  hide(predResult);

  imageDisplay.classList.remove("loading");

}

function previewFile(i, _callback) {

  var request = new XMLHttpRequest();
  request.onreadystatechange = function () {
    if (request.readyState == XMLHttpRequest.DONE) {
      if (this.status == 404) {
        allimageloaded = true;
        console.log("All images are loaded.");
      }
    }
  };
  request.open('GET', "http://127.0.0.1:8887/blocks/" + i + ".png", true);
  console.log(i);
  request.responseType = 'blob';

  request.onload = function () {
    var reader = new FileReader();
    reader.readAsDataURL(request.response);
    reader.onload = function (e) {
      imagePreview.src = e.target.result;
      imagePreview.width = "128";
      imagePreview.height = "128";
      show(imagePreview);
      // reset
      imageDisplay.classList.remove("loading");

      displayImage(reader.result, "image-display");
    };
  }

  request.send();


  _callback();
}

//========================================================================
// Helper functions
//========================================================================

function displayImage(image, id) {
  // display image on given id <img> element
  let display = document.getElementById(id);
  display.src = image;
  show(display);
}

function hide(el) {
  // hide an element
  el.classList.add("hidden");
}

function show(el) {
  // show an element
  el.classList.remove("hidden");
}


initialize();