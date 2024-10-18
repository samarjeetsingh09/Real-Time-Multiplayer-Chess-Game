// // alert("hello")
// //basic socket io setup
// const socket = io(); //website is now connected to the backend and socket automatically  and a request will be sent to the backend io.on() function

// socket.emit("churan");//emit - through karnaaa...   churan is the event that we aree passing or giving to the backend
// socket.on("churan papdi",()=>{
//     console.log("churan papadi mill gai ")
// })  // catch kr rhe hai data joo ki ab backend ne bhejaa hia   auur aur aur iska jo console log waala statememnt hoga cvpp front end pr aaiga mtlb ki insept pr jaakr console deknaa padegaaa browser kaaa as yee front end pr aa rha hai data backend se so front end pr hi show case hoga

const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const whiteCapturedElement = document.getElementById("white-captured");
const blackCapturedElement = document.getElementById("black-captured");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Arrays to store captured pieces
let capturedWhitePieces = [];
let capturedBlackPieces = [];

const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((col, colindex) => {
            const squareElement = document.createElement("div");
            squareElement.classList.add(
                "square",
                (rowindex + colindex) % 2 === 0 ? "light" : "dark"
            );

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = colindex;

            if (col) {
                const pieceElement = document.createElement("div");
                pieceElement.classList.add(
                    "piece",
                    col.color === "w" ? "white" : "black"
                );
                pieceElement.innerText = getPieceUnicode(col);
                pieceElement.draggable = playerRole === col.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: colindex };
                        e.dataTransfer.setData("text/plain", "");
                    }
                });
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });

                squareElement.appendChild(pieceElement);
            }
            squareElement.addEventListener("dragover", (e) => {
                e.preventDefault();
            });
            squareElement.addEventListener("drop", (e) => {
                e.preventDefault();
                if (draggedPiece) {
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),
                        col: parseInt(squareElement.dataset.col),
                    };
                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });

    // Render flipped board if black
    if (playerRole === "b") {
        boardElement.classList.add("flipped");
    } else {
        boardElement.classList.remove("flipped");
    }

    // Render captured pieces
    renderCapturedPieces();
};

const handleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: "q", // Promotion to queen if pawn reaches the end
    };

    const moveResult = chess.move(move);

    if (moveResult && moveResult.captured) {
        // If a piece is captured, add it to the respective array
        if (moveResult.color === "w") {
            capturedBlackPieces.push(moveResult.captured);
        } else {
            capturedWhitePieces.push(moveResult.captured);
        }
    }

    socket.emit("move", move);
};

// Render the captured pieces
const renderCapturedPieces = () => {
    whiteCapturedElement.innerHTML = "";
    blackCapturedElement.innerHTML = "";

    capturedWhitePieces.forEach((piece) => {
        const pieceElement = document.createElement("div");
        pieceElement.innerText = getPieceUnicode({ type: piece, color: "b" });
        whiteCapturedElement.appendChild(pieceElement);
    });

    capturedBlackPieces.forEach((piece) => {
        const pieceElement = document.createElement("div");
        pieceElement.innerText = getPieceUnicode({ type: piece, color: "w" });
        blackCapturedElement.appendChild(pieceElement);
    });
};

const getPieceUnicode = (piece) => {
    const unicodePiece = {
        k: "♔",
        q: "♕",
        r: "♖",
        b: "♗",
        n: "♘",
        p: "♙",
        K: "♚",
        Q: "♛",
        R: "♜",
        B: "♝",
        N: "♞",
        P: "♟",
    };
    return unicodePiece[piece.type] || "";
};

socket.on("playerRole", (role) => {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", () => {
    playerRole = null;
    renderBoard();
});

socket.on("boardState", (fen) => {
    chess.load(fen);
    renderBoard();
});

socket.on("move", (move) => {
    chess.move(move);
    renderBoard();
});

renderBoard();
