import { Router } from 'express';
import authController from './auth.controller';
import { validate } from '../../middlewares/validator';
import { registerValidation, loginValidation } from './auth.validation';
import { authenticate } from '../../middlewares/auth';

const router = Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  validate(registerValidation),
  authController.register
);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  validate(loginValidation),
  authController.login
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

export default router;
