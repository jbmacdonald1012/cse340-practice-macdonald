import { Router } from 'express';
import { validationResult } from 'express-validator';
import { contactValidationRules } from '../../middleware/validation/forms.js';
import { createContactForm, getAllContactForms } from '../../models/forms/contact.js';

const router = Router();

const showContactForm = (req, res) => {
    res.render('forms/contact/form', {
        title: 'Contact Us'
    });
};

const handleContactSubmission = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        errors.array().forEach(error => req.flash('error', error.msg));
        return res.redirect('/contact');
    }

    const { subject, message } = req.body;

    try {
        await createContactForm(subject, message);
        req.flash('success', 'Thank you for contacting us! We will respond soon.');
        res.redirect('/contact');
    } catch (error) {
        console.error('Error saving contact form:', error);
        req.flash('error', 'Unable to submit your message. Please try again later.');
        res.redirect('/contact');
    }
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
