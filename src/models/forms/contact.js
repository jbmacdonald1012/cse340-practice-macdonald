import db from '../db.js';

/**
 * Insert a new contact form submission into the database.
 *
 * @param {string} subject - The subject line of the message
 * @param {string} message - The body of the message
 * @returns {Promise<Object>} The newly created contact form row
 */
const createContactForm = async (subject, message) => {
    const query = `
        INSERT INTO contact_form (subject, message)
        VALUES ($1, $2)
        RETURNING id, subject, message, submitted
    `;
    const result = await db.query(query, [subject, message]);
    return result.rows[0];
};

/**
 * Retrieve all contact form submissions, most recent first.
 *
 * @returns {Promise<Array>} Array of contact form objects
 */
const getAllContactForms = async () => {
    const query = `
        SELECT id, subject, message, submitted
        FROM contact_form
        ORDER BY submitted DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

export { createContactForm, getAllContactForms };
