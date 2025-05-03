const express = require("express")
const router = express.Router()

const {
    insertContent,
    getContent,
    getContentByID,
    updateContent,
    deleteContent,
    createContentImages,
    removeContentImage
} = require("../controllers/content")

const { authCheck, adminCheck } = require("../middlewares/authCheck")

router.post("/contents", authCheck, adminCheck, insertContent)

router.get("/contents", getContent)
router.get("/contents/:id", getContentByID)

router.put("/contents/:id", authCheck, adminCheck, updateContent)
router.delete("/contents/:id", authCheck, adminCheck, deleteContent)

router.post("/create-content-images", authCheck, adminCheck, createContentImages)
router.post("/remove-content-images", authCheck, adminCheck, removeContentImage)


module.exports = router