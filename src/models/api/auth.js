import db from "../../config/db.js";


export const get_admin_data_by_email = async (email) => {
    try {
        return await db.query(`SELECT * FROM tbl_admin WHERE email = ?`, [email]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to fetch user data.");
    }
};



export const get_admin_data_by_id = async (admin_id) => {
    try {
        return await db.query(`SELECT * FROM tbl_admin WHERE admin_id = ?`, [admin_id]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to fetch user data.");
    }
};

export const get_user_data_by_id = async (user_id) => {
    try {
        return await db.query(`SELECT * FROM tbl_users WHERE admin_id = ?`, [user_id]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to fetch user data.");
    }
};

export const update_admin_data = async (reset_password_token, reset_password_token_expiry, email) => {
    try {
        return await db.query('UPDATE tbl_admin SET reset_password_token = ?, reset_password_token_expiry = ? WHERE email = ?', [reset_password_token, reset_password_token_expiry, email]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update admin data");
    }
};

export const update_admin_password = async (password, show_password, email) => {
    try {
        return await db.query(`UPDATE tbl_admin SET password = ?, show_password = ? WHERE email = ?`,
            [password, show_password, email]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update admin data");
    }
};

export const update_admin_profile = async (full_name, profile_image, mobile_number, address, latitude, longitude, admin_id) => {
    try {
        return await db.query(`UPDATE tbl_admin SET name = ?, profile_image = ?, mobile_number =?, address=?, latitude = ? , longitude = ?   WHERE admin_id = ?`,
            [full_name, profile_image, mobile_number, address, latitude, longitude, admin_id]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update admin data");
    }
};

export const get_user_data_by_email = async (email) => {
    try {
        return await db.query(`SELECT * FROM tbl_users WHERE email = ?`, [email]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to fetch user data.");
    }
};

export const get_admin_data_by = async (token) => {
    try {
        return await db.query(`SELECT * FROM tbl_admin WHERE reset_password_token = ? AND reset_password_token_expiry > ?`,
            [token, new Date()]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to fetch admin data.");
    }
};

export const update_admin_data_by = async (hashedPassword, newPassword, admin_id) => {
    try {
        return await db.query(`UPDATE tbl_admin SET password = ?, show_password = ?, reset_password_token = NULL, reset_password_token_expiry = NULL WHERE admin_id = ?`,
            [hashedPassword, newPassword, admin_id]);
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update admin data.");
    }
};