import path from 'path';
import Joi from 'joi';
import ejs from 'ejs';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import Msg from '../../utils/message.js';
import { sendEmail } from '../../services/send_email.js';
import { handleError, handleSuccess, joiErrorHandle } from '../../utils/responseHandler.js';
import { get_admin_data_by, get_admin_data_by_email, get_admin_data_by_id, update_admin_data, update_admin_data_by, update_admin_password, update_admin_profile } from '../../models/api/auth.js';





const saltRounds = process.env.SALT_ROUNDS;
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


//======================================= Auth ============================================

export const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const schema = Joi.object({
            email: Joi.string().min(5).max(255).email({ tlds: { allow: false } }).lowercase().required(),
            password: Joi.string().min(8).max(15).required()
        });
        const result = schema.validate(req.body);
        if (result.error) return joiErrorHandle(res, result.error);
        const [existingAdmin] = await get_admin_data_by_email(email);

        if (!existingAdmin) {
            return handleError(res, 400, Msg.INVALID_EMAIL_PASSWORD);
        }
        const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordValid) {
            return handleError(res, 400, Msg.INVALID_EMAIL_PASSWORD);
        }
        const token = jwt.sign({ admin_id: existingAdmin.admin_id, email: existingAdmin.email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRY
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: Msg.LOGIN_SUCCESSFUL,
            token: token
        })
    } catch (error) {
        console.error(error);
        return handleError(res, 500, error.message);
    }
};

export const render_forgot_password_page = (req, res) => {
    try {
        return res.render("resetPasswordAdmin.ejs");
    } catch (error) {
        return handleError(res, 500, error.message)
    }
};

export const forgot_password = async (req, res) => {
    try {
        const forgotPasswordSchema = Joi.object({
            email: Joi.string().email().required(),
        });
        const { error, value } = forgotPasswordSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { email } = value;
        const [admin] = await get_admin_data_by_email(email);
        if (!admin) {
            return handleError(res, 404, Msg.ADMIN_NOT_FOUND);
        }

        if (admin.is_verified === false) {
            return handleError(res, 400, Msg.VERIFY_EMAIL_FIRST);
        }
        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetTokenExpiry = new Date(Date.now() + 3600000);

        const update_admin_datad = await update_admin_data(resetToken, resetTokenExpiry, email)

        const resetLink = `${req.protocol}://${req.get("host")}/admin/reset-password?token=${resetToken}`;
        const emailTemplatePath = path.resolve(__dirname, "../../views/forgotPassword.ejs");
        const emailHtml = await ejs.renderFile(emailTemplatePath, { resetLink, image_logo });
        const emailOptions = {
            to: email,
            subject: "Password Reset Request",
            html: emailHtml,
        };
        await sendEmail(emailOptions);
        return handleSuccess(res, 200, Msg.PASSWORD_RESET_LINK_SENT(email));
    } catch (error) {
        console.log(error);

        return handleError(res, 500, error.message);
    }
};

export const reset_password = async (req, res) => {
    try {
        const resetPasswordSchema = Joi.object({
            token: Joi.string().required(),
            newPassword: Joi.string().min(8).required().messages({
                "string.min": "Password must be at least 8 characters long",
                "any.required": "New password is required",
            }),
        });
        const { error, value } = resetPasswordSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { token, newPassword } = value;

        const [admin] = await get_admin_data_by(token)
        if (!admin) {
            return handleError(res, 400, Msg.INVALID_EXPIRED_TOKEN);
        }

        if (admin.show_password === newPassword) {
            return handleError(res, 400, Msg.PASSWORD_CAN_NOT_SAME);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const update_result = await update_admin_data_by(hashedPassword, newPassword, admin.admin_id)
        return handleSuccess(res, 200, Msg.PASSWORD_RESET_SUCCESS);

    } catch (error) {
        console.error("Error in reset password controller:", error);
        return handleError(res, 500, error.message);
    }
};

export const render_success_reset = (req, res) => {
    return res.render("successReset.ejs")
}

export const getProfile = async (req, res) => {
    try {
        const adminReq = req.admin;
        const [admin] = await get_admin_data_by_id(adminReq.admin_id)
        if (!admin) {
            return handleError(res, 404, Msg.ADMIN_NOT_FOUND);
        }
        if (admin.profile_image && !admin.profile_image.startsWith("http")) {
            admin.profile_image = `${APP_URL}${admin.profile_image}`;
        }
        return handleSuccess(res, 200, Msg.ADMIN_PROFILE_FETCHED, admin);
    } catch (error) {
        console.error("Error in getProfile:", error);
        return handleError(res, 500, error.message);
    }
};

export const updateProfile = async (req, res) => {
    try {
        const updateProfileSchema = Joi.object({
            name: Joi.string().required(),
            address: Joi.string().required(),
            latitude: Joi.string().required(),
            longitude: Joi.string().required(),
            mobile_number: Joi.string().required(),
        });

        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { name, mobile_number, address, latitude, longitude } = value;
        const adminReq = req.admin;
        const [admin] = await get_admin_data_by_id(adminReq.admin_id)
        if (!admin) {
            return handleError(res, 404, Msg.ADMIN_NOT_FOUND);
        }
        let profile_image = admin.profile_image;
        if (req.file) {
            profile_image = req.file.filename;
        }
        const update_profile = await update_admin_profile(name, profile_image, mobile_number, address, latitude, longitude, adminReq.admin_id)

        return handleSuccess(res, 200, "Profile updated successfully");
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};

export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const changePasswordSchema = Joi.object({
            currentPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
        });

        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) return joiErrorHandle(res, error);


        const admin = req.admin;
        if (!admin) {
            return handleError(res, 404, Msg.ADMIN_NOT_FOUND);
        }

        const isMatch = await bcrypt.compare(currentPassword, admin.password);
        if (!isMatch) {
            return handleError(res, 400, Msg.CURRENT_PASSWORD_INCORRECT);
        }

        if (admin.show_password === newPassword) {
            return handleError(res, 400, Msg.PASSWORD_CAN_NOT_BE_SAME);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);


        const update_admin = await update_admin_password(hashedPassword, newPassword, admin.email)

        return handleSuccess(res, 200, Msg.PASSWORD_CHANGED_SUCCESSFULLY);
    } catch (error) {
        return handleError(res, 500, error.message);
    }
};