import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import { requireLogin } from '../../middleware/auth.js';
import {
    emailExists, saveUser, getAllUsers,
    getUserById, updateUser, deleteUser
} from '../../models/forms/registration.js';

const router = Router();

const registrationValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage("Name can only contain letters, spaces, hyphens, and apostrophes"),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),
    body('emailConfirm')
        .trim()
        .custom((value, { req }) => value === req.body.email)
        .withMessage('Email addresses must match'),
    body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match'),
];

const editValidation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email address is too long'),
];

const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'User Registration'
    });
};

const processRegistration = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/register');
    }

    const { name, email, password } = req.body;

    try {
        const duplicate = await emailExists(email);
        if (duplicate) {
            req.flash('warning', 'An account with that email already exists. Please log in.');
            return res.redirect('/register');
        }

        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await saveUser(name, email, hashedPassword);
        req.flash('success', 'Registration successful! Please log in.');
        res.redirect('/login');
    } catch (error) {
        console.error('Error saving registration:', error);
        req.flash('error', 'Unable to complete registration. Please try again later.');
        res.redirect('/register');
    }
};

const showAllUsers = async (req, res) => {
    let users = [];
    try {
        users = await getAllUsers();
    } catch (error) {
        console.error('Error retrieving users:', error);
    }
    res.render('forms/registration/list', {
        title: 'Registered Users',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
};

const showEditAccountForm = async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;

    if (currentUser.id !== targetId && currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to edit this account.');
        return res.redirect('/register/list');
    }

    try {
        const targetUser = await getUserById(targetId);
        if (!targetUser) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }
        res.render('forms/registration/edit', {
            title: 'Edit Account',
            user: targetUser
        });
    } catch (error) {
        console.error('Error fetching user for edit:', error);
        req.flash('error', 'Unable to load account. Please try again later.');
        res.redirect('/register/list');
    }
};

const processEditAccount = async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;

    if (currentUser.id !== targetId && currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to edit this account.');
        return res.redirect('/register/list');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect(`/register/${targetId}/edit`);
    }

    const { name, email } = req.body;

    try {
        const updated = await updateUser(targetId, name, email);
        if (!updated) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }

        // If the user edited their own account, update the session
        if (currentUser.id === targetId) {
            req.session.user.name = updated.name;
            req.session.user.email = updated.email;
        }

        req.flash('success', 'Account updated successfully.');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error updating user:', error);
        req.flash('error', 'Unable to update account. Please try again later.');
        res.redirect(`/register/${targetId}/edit`);
    }
};

const processDeleteAccount = async (req, res) => {
    const targetId = parseInt(req.params.id, 10);
    const currentUser = req.session.user;

    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete accounts.');
        return res.redirect('/register/list');
    }

    if (currentUser.id === targetId) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/register/list');
    }

    try {
        const deleted = await deleteUser(targetId);
        if (!deleted) {
            req.flash('error', 'User not found.');
            return res.redirect('/register/list');
        }
        req.flash('success', 'Account deleted successfully.');
        res.redirect('/register/list');
    } catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'Unable to delete account. Please try again later.');
        res.redirect('/register/list');
    }
};

router.get('/', showRegistrationForm);
router.post('/', ...registrationValidation, processRegistration);
router.get('/list', showAllUsers);
router.get('/:id/edit', requireLogin, showEditAccountForm);
router.post('/:id/edit', requireLogin, ...editValidation, processEditAccount);
router.post('/:id/delete', requireLogin, processDeleteAccount);

export default router;
