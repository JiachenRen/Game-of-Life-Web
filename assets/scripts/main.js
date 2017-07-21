var cellMatrix;
var resultMat;
var recordedMatrix;
var margin = 0;
var cellWidth = 10;
var pixelDensity2 = true; //set pixel density to 2.
var setting;
var iteratingThreadIds;

//grab the canvas and context from HTML document.
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

$(document).ready(function () {
    window.addEventListener("resize", renew);
});

//TODO: debug
//prevents mobile devices from scrolling.
$(document).on('touchstart', function (e) {
    if (e.target.nodeName !== 'INPUT') {
        e.preventDefault();
        mouseDownEvtHandler(e);
    }
});

//TODO: debug
$(document).on('touchmove', mouseMoveEvtHandler);

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    //updates the pixel density
    if (pixelDensity2) {
        canvas.style.width = canvas.width + "px";
        canvas.style.height = canvas.height + "px";
        canvas.width = canvas.width * 2;
        canvas.height = canvas.height * 2;
    }
}

function renew() {
    clearAllThreads();
    resizeCanvas();
    window["cols"] = parseInt(canvas.width / cellWidth);
    window["rows"] = parseInt(canvas.height / cellWidth);
    cellWidth = (canvas.width / cols + canvas.height / rows) / 2;
    initCellMatrix();
    requestAnimationFrame(draw);
}

function init() {
    renew();

    //init mouse event listeners
    canvas.addEventListener("mousedown", mouseDownEvtHandler, false);
    canvas.addEventListener("mousemove", mouseMoveEvtHandler, false);
    window.addEventListener("mouseup", function () {
        setting = false
    }, false);

    requestAnimationFrame(draw);
}

function draw() {
    updateCells(margin, margin);
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
    resultMat = cellMatrix.map(function (arr) {
        return arr.slice();
    });
}

function updateCells(x, y) {
    for (var r = 0; r < cellMatrix.length; r++) {
        for (var c = 0; c < cellMatrix[0].length; c++) {
            if (cellMatrix[r][c] !== resultMat[r][c]) {
                if (resultMat[r][c]) ctx.fillStyle = "#C2E7DA";
                else ctx.fillStyle = "#330C2F";
                ctx.ellipse(x + c * cellWidth + cellWidth / 2, y + r * cellWidth + cellWidth / 2, cellWidth / 2 - 1, cellWidth / 2 - 1);
                ctx.fill();
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
    cellMatrix[cellPos.r][cellPos.c] = recordedMatrix[cellPos.r][cellPos.c];
    resultMat[cellPos.r][cellPos.c] = true;
    draw();
    cellMatrix[cellPos.r][cellPos.c] = !recordedMatrix[cellPos.r][cellPos.c];
    resultMat[cellPos.r][cellPos.c] = cellMatrix[cellPos.r][cellPos.c];
    requestAnimationFrame(draw)
}

function getCellPos(mouse) {
    return {
        r: parseInt((mouse.y - margin) / cellWidth),
        c: parseInt((mouse.x - margin) / cellWidth)
    }
}

function step() {
    resultMat = cellMatrix.map(function (arr) {
        return arr.slice();
    });

    for (var r = 0; r < cellMatrix.length; r++) {
        for (var c = 0; c < cellMatrix[0].length; c++) {
            var numAlive = numCellsAlive(r, c);
            if (cellMatrix[r][c])
                resultMat[r][c] = numAlive > 1 && numAlive < 4;
            else resultMat[r][c] = numAlive === 3;
        }
    }
    draw();
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

function clearAllThreads() {
    if (typeof(iteratingThreadIds) === "undefined") return;
    while (iteratingThreadIds.length > 0) {
        clearInterval(iteratingThreadIds.splice(0, 1)[0]);
    }
}

function clearBoard() {
    renew();
}