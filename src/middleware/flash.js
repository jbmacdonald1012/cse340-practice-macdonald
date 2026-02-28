/**
 * Flash message middleware
 *
 * Provides req.flash(type?, message?) for storing one-time messages in the session,
 * and exposes flash() in EJS templates via res.locals.flash.
 */

const flashMiddleware = (req, res, next) => {
    if (!req.session) {
        return next();
    }

    if (!req.session.flash) {
        req.session.flash = {};
    }

    let flashWasSet = false;

    req.flash = (type, message) => {
        // req.flash() — retrieve and clear all messages
        if (type === undefined) {
            const all = req.session.flash;
            req.session.flash = {};
            return all;
        }

        // req.flash('type') — retrieve and clear messages of one type
        if (message === undefined) {
            const messages = req.session.flash[type] || [];
            delete req.session.flash[type];
            return messages;
        }

        // req.flash('type', 'message') — store a message
        if (!req.session.flash[type]) {
            req.session.flash[type] = [];
        }
        req.session.flash[type].push(message);
        flashWasSet = true;
    };

    // Override res.redirect to save the session before redirecting when flash was set
    const originalRedirect = res.redirect.bind(res);
    res.redirect = (...args) => {
        if (flashWasSet && req.session) {
            req.session.save(() => originalRedirect(...args));
        } else {
            originalRedirect(...args);
        }
    };

    next();
};

const flashLocals = (req, res, next) => {
    res.locals.flash = req.flash ? req.flash.bind(req) : () => ({});
    next();
};

const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;
