const prisma = require("../config/prisma")
const cloudinary = require("cloudinary").v2

//Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

const insertProduct = async (req, res) => {
    try {
        const { product_name, description, category_id, startingPrice, images } = req.body

        if (!product_name || !description || !startingPrice || !category_id) {
            return res.status(400).json({ message: "ไม่มีค่าที่ส่งมาหรือส่งมาไม่ครบ" })
        }

        const product = await prisma.products.create({
            data: {
                product_name: product_name,
                description: description,
                startingPrice: startingPrice,
                category_id: Number(category_id),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

const getProduct = async (req, res) => {
    try {
        const { category_id, page = 1 } = req.query // รับ category_id และ page จาก query
        const pageSize = 100 // กำหนดให้แต่ละหน้ามี ... รายการ
        const skip = (Number(page) - 1) * pageSize // คำนวณจุดเริ่มต้นของข้อมูล

        const whereCondition = category_id ? { category_id: Number(category_id) } : {}

        const products = await prisma.products.findMany({
            where: whereCondition,
            orderBy: { createdAt: "desc" },
            take: pageSize, // ดึงข้อมูลแค่ ... รายการ
            skip: skip, // ข้ามข้อมูลตามหน้าที่เลือก
            include: {
                categories: true,
                images: true
            }
        })

        const totalProducts = await prisma.products.count({ where: whereCondition }) // นับจำนวนทั้งหมด

        res.json({
            products,
            totalProducts,
            totalPages: Math.ceil(totalProducts / pageSize), // คำนวณจำนวนหน้าทั้งหมด
            currentPage: Number(page)
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}


const getProductByID = async (req, res) => {
    try {
        const { id } = req.params
        const product = await prisma.products.findFirst({
            where: {
                product_id: Number(id)
            },
            include: {
                categories: true,
                images: true
            }
        })
        res.json(product)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

const updateProduct = async (req, res) => {
    try {
        const { product_name, description, category_id, startingPrice, images } = req.body
        const productId = Number(req.params.id)

        //clear images
        await prisma.productImage.deleteMany({
            where: {
                product_id: productId
            }
        })

        if (!productId) {
            return res.status(400).json({ message: "ไม่ระบุสินค้า" })
        }

        if (!product_name || !description || !startingPrice || !category_id) {
            return res.status(400).json({ message: "ไม่มีค่าที่ส่งมาหรือส่งมาไม่ครบ" })
        }

        const existingProduct = await prisma.products.findFirst({
            where: {
                product_id: productId
            }
        })

        if (!existingProduct) {
            return res.status(404).json({ message: "ไม่มีค่าที่จะแก้ไข" })
        }

        const product = await prisma.products.update({
            where: {
                product_id: productId
            },
            data: {
                product_name: product_name,
                description: description,
                category_id: Number(category_id),
                startingPrice: startingPrice,
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url
                    }))
                }
            }
        })
        res.json(product)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        //Step 1 ค้นหาสินค้า include images
        const product = await prisma.products.findFirst({
            where: {
                product_id: Number(id)
            },
            include: {
                images: true
            }
        })

        if (!product) {
            return res.status(400).json({ message: "Product Not Found" })
        }

        //Step 2 ลบใน cloudinary, Promise ลบแบบรอด้วย (มันทำงานช้า)
        // promise มี 2 สถานะคือ resolve = ทำงานสำเร็จ, reject = ผิดพลาด
        const deleteImage = product.images.map((image) =>
            new Promise((resolve, reject) => {
                //ลบจาก cloud
                cloudinary.uploader.destroy(image.public_id, (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                })
            })
        )
        await Promise.all(deleteImage) // Promise.all = รอ

        //Step 3 ลบสินค้าใน database sql
        const deleted = await prisma.products.delete({
            where: {
                product_id: Number(id)
            }
        })

        res.json(deleted)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

//ตอนกดเพิ่มรูปใน input รูปภาพแล้วมันจะอัพทันทีพร้อมแสดงให้ผู้ใช้เห็น
const createProductImages = async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({ message: "No image provided" });
        }

        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `shop-${Date.now()}`,
            resource_type: "auto",
            folder: "The_Shop"
        });

        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
};


//ปุ่มกด X ลบรูป
const removeProductImage = async (req, res) => {
    try {
        const { public_id } = req.body;
        const result = await cloudinary.uploader.destroy(public_id);
        res.json({ message: "Remove Image Success", result });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" });
    }
};


module.exports = {
    insertProduct,
    getProduct,
    getProductByID,
    updateProduct,
    deleteProduct,
    createProductImages,
    removeProductImage
}