const express = require("express")
const router = express.Router()

const {
    insertProduct,
    getProduct,
    getProductByID,
    updateProduct,
    deleteProduct,
    createProductImages,
    removeProductImage
} = require("../controllers/product")

const { authCheck, adminCheck } = require("../middlewares/authCheck")

router.post("/products", authCheck, adminCheck, insertProduct)

router.get("/products", getProduct)
router.get("/products/:id", getProductByID)

router.put("/products/:id", authCheck, adminCheck, updateProduct)
router.delete("/products/:id", authCheck, adminCheck, deleteProduct)

router.post("/create-product-images", authCheck, adminCheck, createProductImages)
router.post("/remove-product-images", authCheck, adminCheck, removeProductImage)

module.exports = router