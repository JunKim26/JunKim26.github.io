
// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
var url = 'https://junkim26.github.io/assets/pdf/mobile_prototypes.pdf';


// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    canvas = document.getElementById('the-canvas'),
    ctx = canvas.getContext('2d');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport({scale: document.getElementById("pdf-scale").innerHTML});
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
  document.getElementById("input_page").value = pageNum;
}
document.getElementById('prev').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  
  pageNum++;
  queueRenderPage(pageNum);
  document.getElementById("input_page").value = pageNum;
}

document.getElementById('next').addEventListener('click', onNextPage);


/**
 * Displays input page.
 */

function onInputPage(value){
	if ( value > pdfDoc.numPages) {
    return;
  }
  if (value < 1) {
    return;
  }
  
  pageNum = value;
  queueRenderPage(pageNum);
}

document.getElementById('input_page').addEventListener('change', function(evt){
	num_page = Number(this.value);
  onInputPage(num_page);
	}
);

/**
 * Changes Canvas size depending on viewport.
 */

function changeSize(x) {
  if (x.matches) { // If media query matches
    document.getElementById("pdf-scale").innerHTML = 0.5;
  } else {
    document.getElementById("pdf-scale").innerHTML = 1.5;
  }
}

var x = window.matchMedia("(max-width: 700px)")
changeSize(x) // Call listener function at run time

x.addListener(changeSize) // Attach listener function on state changes


/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page_count').textContent = pdfDoc.numPages;

  // Initial/first page rendering
  renderPage(pageNum);
});
