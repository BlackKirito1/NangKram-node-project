const prisma = require("../config/prisma")

const insertCategory = async (req, res) => {
    try {

        const { email } = req.user

        const { category_name } = req.body

        if (!category_name) {
            return res.status(400).json({ message: "ข้อมูลไม่ครบ" })
        }

        const admin = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!admin) {
            return res.status(404).json({ message: "ไม่พบข้อมูล admin" })
        }

        const category = await prisma.categories.create({
            data: {
                category_name: category_name,
            }
        })
        res.json(category)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const getCategory = async (req, res) => {
    try {
        const category = await prisma.categories.findMany()
        res.json(category)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const getCategoryByID = async (req, res) => {
    try {
        const { id } = req.params
        console.log(id)
        const category = await prisma.categories.findFirst({
            where: {
                category_id: Number(id)
            }
        })
        res.json(category)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const updateCategory = async (req, res) => {
    try {
        const { category_name } = req.body
        const categoryId = Number(req.params.id)

        if (!categoryId) {
            return res.status(400).json({ message: "ไม่ระบุประเภทสินค้า" })
        }

        if (!category_name) {
            return res.status(400).json({ message: "ไม่มีค่าที่ส่งมา" })
        }

        const existingCategory = await prisma.categories.findFirst({
            where: {
                category_id: categoryId
            }
        })

        if (!existingCategory) {
            return res.status(404).json({ message: "ไม่มีค่าที่จะแก้ไข" })
        }

        const category= await prisma.categories.update({
            where: {
                category_id: categoryId
            },
            data: {
                category_name: category_name,
            }
        })

        res.json(category)

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Server error" })
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params
        const category = await prisma.categories.delete({
            where: {
                category_id: Number(id)
            }
        })
        res.json(category)
    } catch (error) {
        console.log(err)
        return res.status(500).json({ message: "Server error" })
    }
}

module.exports = {
    insertCategory,
    getCategory,
    getCategoryByID,
    updateCategory,
    deleteCategory
}