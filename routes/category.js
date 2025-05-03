const express = require("express")
const router = express.Router()

const {
    insertCategory,
    getCategory,
    getCategoryByID,
    updateCategory,
    deleteCategory
} = require("../controllers/category")

const { authCheck, adminCheck } = require("../middlewares/authCheck")

router.post("/categories", authCheck, adminCheck, insertCategory)

router.get("/categories", getCategory)
router.get("/categories/:id", getCategoryByID)

router.put("/categories/:id", authCheck, adminCheck, updateCategory)
router.delete("/categories/:id", authCheck, adminCheck, deleteCategory)

module.exports = router