const express = require("express");
const socket = require("socket.io");
const http = require("http")
const {Chess} = require("chess.js");

const app=express();
const path= require("path");
const { log } = require("console");
const port=3000;

const server=http.createServer(app);
const io = socket(server); // it means socket will be userd on that server intiallized in the IO..

const chess = new Chess();
const players = {};
let currentPlayer = "w";


app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));

io.on("connection",(uniquesocket)=>{ //uniquesocket contains the unique information about the user connected...
    console.log("a new user connected");


    if(!players.white){
        players.white = uniquesocket.id;
        uniquesocket.emit("playerRole","w");
    }
    else if(!players.black){
        players.black = uniquesocket.id;
        uniquesocket.emit("playerRole","b");
    }
    else{
        // players.white = uniquesocket.id;
        uniquesocket.emit("Spectator role");
    }


    uniquesocket.on("disconnect",()=>{
         if(uniquesocket.id === players.white){
            delete players.white;
            console.log("White disconnected");
            
         }
         else if(uniquesocket.id === players.black){
            delete players.black;
            console.log("White disconnected");
         }
    })
    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return;

            const result = chess.move(move);
            if(result){
                currentPlayer = chess.turn();
                io.emit("move",move);
                io.emit("boardState",chess.fen());
            }
            else
            {
                console.log("Invalid move: ",move);
                uniquesocket.emit("invalidMove", move);
            }
            }
        catch(err){
               console.log(err);
               uniquesocket.emit("Invalid move:",move);
        }
      })
    });


app.get("/", (req,res)=>{
    res.render("index")
});

server.listen(port,()=>{
    console.log("Server is woking fine..")
});




// io.on("connection",(uniquesocket)=>{ //uniquesocket contains the unique information about the user connected...
//     console.log("a new user connected");

//     uniquesocket.on("churan",()=>{
//        // console.log("churan mill gyaa haii safelyyyy"); // it means that the event that was named as churan is being catched here and executed successfully
//         io.emit("churan papdi") // that is ki jaise hi backend ko front end se churan milaa tou voo uss churan papdi bhej dega sabhi ko  joo bhi connected hai uske frontend pr...
        
//         //ab  disconnect ka feature  
//         uniquesocket.on("disconnect",()=>{
//             console.log("disconnected");   // iska mtlb ye hai ki jaise hi fronteand aur backend ka connectuion  break hogaa tou use rdissconnect hogaa and iss time socket ek event fie krtaa hia "disconnect " naam kaaa .....
            
//         })

//     })
// })
//emit mtlb bhejna 
//on ka mtlb hai catch kranaa jo bhi bhejaa gya hai 