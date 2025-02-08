const express = require("express")
const app = express()

app.listen("5000", ()=>{
    console.log("I'm listenin' aight")
})

app.get("/test", (req, res)=>{
    res.status(200).json({message:"hello world"})
})

app.get("/test/:name", (req, res)=>{
    const name = req.params.name;
    res.status(200).json({message:`halo ${name}`})
})