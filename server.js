const express = require("express")
const morgan = require("morgan")
const cors = require("cors")
const app = express()
const portNumber = 8080
const { readdirSync } = require("fs")

app.use(express.json({ limit: "20mb" }))
app.use(morgan("dev"))
app.use(cors())

app.get("/", (req, res) => {
    res.json({
        status: "ok",
        message: "Hello"
    })
})

//http://localhost:8080/api
readdirSync("./routes").map((item) => app.use("/api", require("./routes/" + item)))

app.listen(portNumber, () => {
    console.log(`Server is running on port ${portNumber}`)
})