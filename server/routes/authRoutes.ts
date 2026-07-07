import { Router } from "express";
import { body } from "express-validator";
import { registerUser, loginUser, getMe } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validationMiddleware";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Validation chains
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const loginValidation = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// Routes
router.post(
  "/register",
  registerValidation,
  validateRequest,
  asyncHandler(registerUser)
);

router.post(
  "/login",
  loginValidation,
  validateRequest,
  asyncHandler(loginUser)
);

router.get("/me", protect, asyncHandler(getMe));

export default router;
