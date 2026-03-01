import db from '../db.js';

const emailExists = async (email) => {
    const query = `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1) AS exists`;
    const result = await db.query(query, [email]);
    return result.rows[0].exists;
};

const saveUser = async (name, email, hashedPassword) => {
    const roleResult = await db.query(
        "SELECT id FROM roles WHERE role_name = 'user'"
    );
    const userRoleId = roleResult.rows[0]?.id ?? null;

    const query = `
        INSERT INTO users (name, email, password, role_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, created_at
    `;
    const result = await db.query(query, [name, email, hashedPassword, userRoleId]);
    return result.rows[0];
};

const getAllUsers = async () => {
    const query = `
        SELECT id, name, email, created_at
        FROM users
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

const getUserById = async (id) => {
    const query = `
        SELECT
            users.id, users.name, users.email, users.created_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

const updateUser = async (id, name, email) => {
    const query = `
        UPDATE users
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING id, name, email, updated_at
    `;
    const result = await db.query(query, [name, email, id]);
    return result.rows[0] || null;
};

const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export { emailExists, saveUser, getAllUsers, getUserById, updateUser, deleteUser };
