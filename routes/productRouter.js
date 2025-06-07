const { Router } = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/Product.controller.js");
const tokenValidator = require("../middlewares/token-validator.js");
const isAdmin = require("../middlewares/admin-validator.js");

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);

// Solo admins
router.post("/", [tokenValidator, isAdmin], createProduct);
router.put("/:id", [tokenValidator, isAdmin], updateProduct);
router.delete("/:id", [tokenValidator, isAdmin], deleteProduct);

module.exports = router;
