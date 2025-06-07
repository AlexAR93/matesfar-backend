const { Router } = require("express");
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/Category.controller");
const tokenValidator = require("../middlewares/token-validator");
const isAdmin = require("../middlewares/admin-validator");

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Solo admins
router.post("/", [tokenValidator, isAdmin], createCategory);
router.put("/:id", [tokenValidator, isAdmin], updateCategory);
router.delete("/:id", [tokenValidator, isAdmin], deleteCategory);

module.exports = router;
