HEIF_OBJECT = null;
var host = "https://asvinours.github.io/jpeg-to-heif"
// Uncomment the following line for local usage
//var host = ""
var hash = "kitty-551554_1920.jpg";
var cacheBuster = Math.round(new Date().getTime() / 1000,0);
function getSizeOfImage(src, element, addAcceptHeader) {
  var obj = new XMLHttpRequest();
  obj.open('GET', src , true);
  //Needed, so that caching actually works...
  // this are the settings for chrome
  if (addAcceptHeader) {
    obj.setRequestHeader("Accept", "image/webp,image/apng,image/*,*/*;q=0.8");
  }
  console.log("load file size info for " + src)
  obj.onreadystatechange = function () {
    if (obj.readyState == 4) {
      if (obj.status == 200) {
        element.textContent =  humanFileSize(obj.getResponseHeader("Content-Length"), false);
      } else {
        console.log("error for " + src)
      }
    }
  };
  obj.send(null);
}

function humanFileSize(bytes, si) {
  var thresh = si ? 1000 : 1024;
  if(Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }
  var units = si
    ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
    : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  var u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while(Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1)+' '+units[u];
}

function onFileChanged() {
  document.getElementById("heif-filesize").textContent = "Loading ..."
  document.getElementById("jpeg-filesize").textContent = "Loading ..."
  // remove existing items
  var containerEl = document.getElementById('heif-container');
  var heifHeight = null
  if (heifImg = document.getElementById("heif-img")) {
    heifHeight=heifImg.height;
    heifWidth=heifImg.width;
  }
  containerEl.innerHTML = "";
  HEIF_OBJECT = null;

  var imgEl = document.createElement('img');
  imgEl.setAttribute('fps', 30);
  if (heifHeight != null) {
    imgEl.width = heifWidth;
    imgEl.height = heifHeight;

  }
  //imgEl.width = 200;
  //imgEl.height = 200;
  imgEl.src = "must-be-here-for-reasons.heic"
  containerEl.appendChild(imgEl);
  imgEl.id = "heif-img"
  var heifCanvas = createHeifCanvas(imgEl);
  if (!heifCanvas) {
    return;
  }

  var urlbase = host + "/images/";
  var urlappend = "";

  if (window.location.href.indexOf("f=webp") > -1){
    urlappend = "-90-cwebp";
  } else if (window.location.href.indexOf("q=90") > -1) {
    urlappend = "-90-jpegoptim";
  }

  var jpegImg = document.getElementById("jpeg-img");
  jpegImg.src =  urlbase + hash + urlappend;

  containerEl.appendChild(heifCanvas);
  imgEl.remove();
  var heifUrl = urlbase + hash + ".heic";
  heifCanvas.setAttribute("filename", heifUrl)
  var heifObject = new HEIFObject(heifCanvas, 'img')
  HEIF_OBJECTS[heifCanvas.id] = heifObject;

  heifObject._heifReader.requestFileInfo(function(payload) {
    if(payload === false || payload.success !== true) {
      document.getElementById("heif-filesize").textContent = "Error loading image";
      console.log("Could not read file:", heifCanvas.getAttribute('filename'));
    } else {
      var fileInfo = payload;
      getSizeOfImage( heifCanvas.getAttribute('filename'), document.getElementById("heif-filesize"));

      heifObject._getFileInfoCallback()(payload);

    }
  });

}

function errorLoadingImage(element, name) {
  if (element !== null && element.getAttribute("src") !== "") {
    document.getElementById(name).textContent = "Error loading image"
  }
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function pageLoaded() {
  var file = getParameterByName("file");
  if (file && file.length > 1) {
      hash = file;
  }
  onFileChanged();
}

