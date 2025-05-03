const prisma = require("../config/prisma")
const cloudinary = require("cloudinary").v2

// Configuration for Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// Insert Content with images
const insertContent = async (req, res) => {
    try {
        const { images } = req.body

        // Create Content in the database
        const content = await prisma.content.create({
            data: {
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

        res.json(content)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Get All Content with images
const getContent = async (req, res) => {
    try {
        const content = await prisma.content.findMany({
            orderBy: {
                createdAt: "desc"
            },
            include: {
                images: true
            }
        })
        res.json(content)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Get Content by ID with images
const getContentByID = async (req, res) => {
    try {
        const { id } = req.params
        const content = await prisma.content.findFirst({
            where: {
                content_id: Number(id)
            },
            include: {
                images: true
            }
        })
        res.json(content)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Update Content
const updateContent = async (req, res) => {
    try {
        const { images } = req.body
        const contentId = Number(req.params.id)

        // Delete existing images
        await prisma.contentImage.deleteMany({
            where: {
                content_id: contentId
            }
        })

        if (!contentId) {
            return res.status(400).json({ message: "ไม่ระบุเนื้อหา" })
        }

        const existingContent = await prisma.content.findFirst({
            where: {
                content_id: contentId
            }
        })

        if (!existingContent) {
            return res.status(404).json({ message: "ไม่พบเนื้อหาที่จะแก้ไข" })
        }

        // Update Content in the database
        const content = await prisma.content.update({
            where: {
                content_id: contentId
            },
            data: {
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

        res.json(content)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Delete Content and associated images
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params

        // Find content by ID and include images
        const content = await prisma.content.findFirst({
            where: {
                content_id: Number(id)
            },
            include: {
                images: true
            }
        })

        if (!content) {
            return res.status(400).json({ message: "ไม่พบเนื้อหาที่จะลบ" })
        }

        // Delete images from Cloudinary
        const deleteImages = content.images.map((image) =>
            new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(image.public_id, (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                })
            })
        )
        await Promise.all(deleteImages) // Wait for all delete requests to complete

        // Delete content in the database
        const deletedContent = await prisma.content.delete({
            where: {
                content_id: Number(id)
            }
        })

        res.json(deletedContent)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Create images for content (similar to product)
const createContentImages = async (req, res) => {
    try {
        if (!req.body.image) {
            return res.status(400).json({ message: "ไม่พบรูปภาพ" })
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `content-${Date.now()}`,
            resource_type: "auto",
            folder: "The_Shop"
        })

        res.json(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

// Remove image from content
const removeContentImage = async (req, res) => {
    try {
        const { public_id } = req.body
        const result = await cloudinary.uploader.destroy(public_id)
        res.json({ message: "ลบรูปภาพสำเร็จ", result })
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "เกิดข้อผิดพลาดในเซิร์ฟเวอร์" })
    }
}

module.exports = {
    insertContent,
    getContent,
    getContentByID,
    updateContent,
    deleteContent,
    createContentImages,
    removeContentImage
}
