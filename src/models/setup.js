import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedPracticeUsers = async () => {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10);
    const seedPassword = process.env.SEED_USER_PASSWORD;

    if (!saltRounds || isNaN(saltRounds)) {
        throw new Error('Missing required env var: BCRYPT_SALT_ROUNDS');
    }
    if (!seedPassword) {
        throw new Error('Missing required env var: SEED_USER_PASSWORD');
    }

    const hashedPassword = await bcrypt.hash(seedPassword, saltRounds);

    const userRoleResult = await db.query(
        "SELECT id FROM roles WHERE role_name = 'user'"
    );
    const adminRoleResult = await db.query(
        "SELECT id FROM roles WHERE role_name = 'admin'"
    );
    const userRoleId = userRoleResult.rows[0]?.id;
    const adminRoleId = adminRoleResult.rows[0]?.id;

    if (!userRoleId || !adminRoleId) {
        console.warn('Roles not found — skipping practice user seeding');
        return;
    }

    // Patch existing users with no role — assign default 'user' role
    await db.query(`
        UPDATE users
        SET role_id = $1
        WHERE role_id IS NULL
    `, [userRoleId]);

    await db.query(`
        INSERT INTO users (name, email, password, role_id)
        VALUES ('Admin', 'admin@example.com', $1, $2)
        ON CONFLICT (email) DO NOTHING
    `, [hashedPassword, adminRoleId]);

    await db.query(`
        INSERT INTO users (name, email, password, role_id)
        VALUES
            ('User One', 'user1@example.com', $1, $2),
            ('User Two', 'user2@example.com', $1, $2)
        ON CONFLICT (email) DO NOTHING
    `, [hashedPassword, userRoleId]);

    console.log('Practice users seeded (existing accounts unchanged)');
};

/**
 * Sets up the database by running the seed.sql file if needed.
 * Checks if faculty table has data - if not, runs a full re-seed.
 */
const setupDatabase = async () => {
    /**
     * Check if faculty table has any rows and wrap in try-catch to handle cases
     * where table doesn't exist yet.
     */
    let hasData = false;
    try {
        const result = await db.query(
            "SELECT EXISTS (SELECT 1 FROM faculty LIMIT 1) as has_data"
        );
        hasData = result.rows[0]?.has_data || false;
    } catch (error) {
        /**
         * If query fails (e.g., table doesn't exist), treat the same as no data.
         * This allows the seed process to proceed.
         */
        hasData = false;
    }
    
    if (!hasData) {
        // No faculty found - run full seed
        console.log('Seeding database...');
        const seedPath = join(__dirname, 'sql', 'seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        await db.query(seedSQL);
        console.log('Database seeded successfully');
    } else {
        console.log('Database already seeded');
    }

    const practicePath = join(__dirname, 'sql', 'practice.sql');
    if (fs.existsSync(practicePath)) {
        const practiceSQL = fs.readFileSync(practicePath, 'utf8');
        await db.query(practiceSQL);
        console.log('Practice database tables initialized');
    }

    await seedPracticeUsers();

    return true;
};

/**
 * Tests the database connection by executing a simple query.
 */
const testConnection = async () => {
    const result = await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful:', result.rows[0].current_time);
    return true;
};

export { setupDatabase, testConnection };