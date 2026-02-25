import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

const contactValidationRules = [
    body('subject').trim().isLength({ min: 2 }).withMessage('Subject must be at least 2 characters'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Contact form validation errors:', errors.array());
        return res.redirect('/contact');
    }

    const { subject, message } = req.body;
    await createContactForm(subject, message);
    res.redirect('/contact/responses');
};

const showContactResponses = async (req, res) => {
    const contactForms = await getAllContactForms();
    res.render('forms/contact/responses', {
        title: 'Contact Responses',
        contactForms
    });
};

router.get('/', showContactForm);
router.post('/', ...contactValidationRules, handleContactSubmission);
router.get('/responses', showContactResponses);

export default router;
