const express = require('express')
const app = express()
const MongoClient = require("mongodb").MongoClient
const url = "mongodb://localhost:27017"
const db_name = "bus-pay"
const port = process.env.PORT || 1339
const socketIOClient = require('socket.io-client')

var io = require('socket.io').listen(8081); 
const socketClient = socketIOClient("http://localhost:8081");

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    next();
});
let soccket 
io.sockets.on('connection', (socket) => {
    soccket = socket;
	socket.on('add_user',  (msg) => {
        var base64Data = msg.file.replace(/^data:image\/png;base64,/, "");
        let id = makeid(6)
        require("fs").writeFile(`${id}.png`, base64Data, 'base64', (err) => {
            if(err) throw err;
            MongoClient.connect(url, (err, db) => {
                if(err) throw err;
                var dbo = db.db(db_name)
                msg.file = `${id}.png`
                dbo.collection("users").insertOne(msg, (err) => {
                    if(err) throw err;
                    db.close()
                })
            })
        });
    });
    socket.on("test", (msg) => {
        console.log(msg)
        socket.emit("test123", msg)
    })
});

app.get("/user", (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        var dbo = db.db(db_name)
        dbo.collection("users").findOne({user_id: parseInt(req.query.user_id, 10)}, (err, result) => {
            if(err) throw err;
            res.json({
                type: result ? "ok" : "bad",
                result: result
            })
        })
    })
})

app.get("/test", (req, res) => {
    socketClient.emit('test', {"user_id": 2281337})
    res.json({a: 1})
})

app.get("/login", (req, res) => {
    MongoClient.connect(url, (err, db) => {
        if(err) throw err;
        var dbo = db.db(db_name)
        dbo.collection("drivers").findOne({id: parseInt(req.query.id, 10)}, (err, result) => {
            if(err) throw err;
            res.json({
                type: result ? "ok" : "bad",
                result: result
            })
        })
    })
})

let makeid = (length) => {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.listen(port, () => {
    console.log("Server listrening on port ", port)
})