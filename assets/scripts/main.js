var cellMatrix;
var recordedMatrix;
var margin = 1;
var cellWidth;
var pixelDensity2 = true;
var setting;
var iteratingThreadIds;
var rows = 100;
var cols = 100;

//grab the canvas and context from HTML document.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');


function init() {
    //set pixel density to 2.
    (function resizeCanvas() {
        var smaller = window.innerWidth > window.innerHeight ? window.innerHeight : window.innerWidth;
        canvas.width = smaller;
        canvas.height = smaller;

        //updates the pixel density
        if (pixelDensity2) {
            canvas.style.width = canvas.width + "px";
            canvas.style.height = canvas.height + "px";
            canvas.width = canvas.width * 2;
            canvas.height = canvas.height * 2;
        }
        requestAnimationFrame(draw);
    })();

    //init mouse event listeners
    canvas.addEventListener("mousedown", mouseDownEvtHandler, false);
    canvas.addEventListener("mousemove", mouseMoveEvtHandler, false);
    window.addEventListener("mouseup", function () {
        setting = false
    }, false);
    //initialize
    initCellMatrix();
    requestAnimationFrame(draw);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMatrix(margin, margin, canvas.width - margin * 2, canvas.height - margin * 2);
    requestAnimationFrame(draw);
}

function initCellMatrix() {
    console.log("designated dim: " + rows + " " + cols);
    cellMatrix = new Array(rows);
    console.log("actual rows: " + cellMatrix.length);
    for (var r = 0; r < rows; r++) {
        cellMatrix[r] = new Array(cols);
        for (var c = 0; c < cols; c++) {
            cellMatrix[r][c] = false;
        }
    }
    console.log("actual: " + cellMatrix.length + " " + cellMatrix[0].length);
    recordedMatrix = cellMatrix;
}

function drawMatrix(x, y, w, h) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    var widthFromW = w / cellMatrix[0].length;
    var widthFromH = h / cellMatrix.length;
    cellWidth = widthFromH > widthFromW ? widthFromW : widthFromH;

    ctx.beginPath();
    //draws the horizontal line
    for (var r = 1; r < cellMatrix.length; r++) {
        ctx.moveTo(x, y + r * cellWidth + 0.5);
        ctx.lineTo(x + w, y + r * cellWidth + 0.5);
    }
    //draws the vertical line
    for (var c = 1; c < cellMatrix[0].length; c++) {
        ctx.moveTo(x + c * cellWidth + 0.5, y);
        ctx.lineTo(x + c * cellWidth + 0.5, y + h);
    }
    ctx.stroke();

    //draws the bonding box
    ctx.strokeRect(x - 0.5, y - 0.5, w, h);

    //draws the active cells
    ctx.fillStyle = "black";
    for (r = 0; r < cellMatrix.length; r++) {
        for (c = 0; c < cellMatrix[0].length; c++) {
            if (cellMatrix[r][c]) {
                ctx.fillRect(x + c * cellWidth, y + r * cellWidth, cellWidth, cellWidth);
            }
        }
    }
}

//TODO: cellMatrixDim.

function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * (pixelDensity2 ? 2 : 1),
        y: (evt.clientY - rect.top) * (pixelDensity2 ? 2 : 1)
    };
}

function mouseDownEvtHandler(evt) {
    setting = true;
    recordedMatrix = cellMatrix.map(function (arr) {
        return arr.slice();
    });
    mouseMoveEvtHandler(evt);
}

function mouseMoveEvtHandler(evt) {
    if (!setting) return;
    var cellPos = getCellPos(getMousePos(evt));
    cellMatrix[cellPos.r][cellPos.c] = !recordedMatrix[cellPos.r][cellPos.c];
}

function getCellPos(mouse) {
    return {
        r: parseInt((mouse.y - margin) / cellWidth),
        c: parseInt((mouse.x - margin) / cellWidth)
    }
}

function step() {
    var resultMat = cellMatrix.map(function (arr) {
        return arr.slice();
    });

    for (var r = 0; r < cellMatrix.length; r++) {
        for (var c = 0; c < cellMatrix[0].length; c++) {
            //console.log("iterating: " + r + " " + c);
            var numAlive = numCellsAlive(r, c);
            if (cellMatrix[r][c])
                resultMat[r][c] = numAlive > 1 && numAlive < 4;
            else resultMat[r][c] = numAlive === 3;
        }
    }


    cellMatrix = resultMat;
}

function numCellsAlive(r, c) {
    var count = 0;
    for (var i = -1; i <= 1; i++) {
        for (var q = -1; q <= 1; q++) {
            if (i === 0 && q === 0) continue;
            var pos = getCorrectedPos(r + i, c + q);
            if (cellMatrix[pos.r][pos.c])
                count++;
        }
    }
    return count;
}

function getCorrectedPos(row, col) {
    var rows = cellMatrix.length;
    var columns = cellMatrix[0].length;
    row = row >= rows ? row - rows : row;
    row = row <= -1 ? rows + row : row;
    col = col >= columns ? col - columns : col;
    col = col <= -1 ? columns + col : col;
    return {
        r: row,
        c: col
    }
}

function addIteratingThread() {
    if (!iteratingThreadIds) {
        iteratingThreadIds = [];
    }
    iteratingThreadIds.push(setInterval(step, 0));
}

function removeIteratingThread() {
    if (iteratingThreadIds.length > 0) {
        clearInterval(iteratingThreadIds[0]);
        iteratingThreadIds.splice(0, 1);
    }
}

function clearAll() {
    while (iteratingThreadIds.length > 0) {
        clearInterval(iteratingThreadIds.splice(0, 1)[0]);
    }
}

function clearBoard() {
    for (var r = 0; r < cellMatrix.length; r++) {
        for (var c = 0; c < cellMatrix[0].length; c++) {
            cellMatrix[r][c] = false;
        }
    }
}

function updateCellMatrix() {
    var rows_ = document.getElementById("rows").value;
    var cols_ = document.getElementById("cols").value;
    rows = rows_;
    cols = cols_;
    initCellMatrix(rows, cols);
    //requestAnimationFrame(draw);
}
