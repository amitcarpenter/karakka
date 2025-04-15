import path from 'path';
import Joi from 'joi';
import ejs from 'ejs';
import dotenv from 'dotenv';
import axios from "axios";
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import fs from 'fs/promises';
import jwt from 'jsonwebtoken';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import Msg from '../../utils/message.js';
import { sendEmail } from '../../services/send_email.js';
import { handleError, handleSuccess, joiErrorHandle } from '../../utils/responseHandler.js';
import { delete_form_data, get_form_data, get_form_data_by_user_id, insert_form_data, update_form_data_in_db } from '../../models/api/form.js';



const saltRounds = process.env.SALT_ROUNDS;
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = process.env.JWT_EXPIRY
const image_logo = process.env.LOGO_URL
const APP_URL = process.env.APP_URL


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();


export const add_update_form_data = async (req, res) => {
    try {
        const schema = Joi.object({
            is_draft: Joi.boolean().required(),
            describe_of_land: Joi.any().optional().allow("", null),
            treatment_plant_details: Joi.any().optional().allow("", null),
            treatment_plant_status: Joi.any().optional().allow("", null),
            land_application_area: Joi.any().optional().allow("", null),
            tests_to_be_completed_every_service: Joi.any().optional().allow("", null),
            annual_testing: Joi.any().optional().allow("", null),
            service_procedure: Joi.any().optional().allow("", null),
            owners_details: Joi.any().optional().allow("", null),
            service_technician_details: Joi.any().optional().allow("", null),
            declaration: Joi.any().optional().allow("", null),
        });
        const { error, value } = schema.validate(req.body);
        if (error) return joiErrorHandle(res, error);
        const { describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, is_draft } = value
        const { user_id } = req.user

        console.log(user_id, "user_id");

        let pdf_file = ""
        if (req.file) {
            pdf_file = req.file.filename
        }

        let response_message = is_draft ? 'Form Data Saved in Draft Successfully' : 'Form Data Submitted Successfully'



        const [form_data] = await get_form_data_by_user_id(user_id)

        if (!form_data) {
            await insert_form_data(describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, pdf_file, user_id)
        } else {
            await update_form_data_in_db(describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, pdf_file, form_data.form_service_id)
        }

        if (!is_draft) {

            const emails = ['texyslogan@gmail.com', 'texysforms1@gmail.com', 'krakka37@gmail.com']
            // const emails = ['amitcarpenter.ctinfotech@gmail.com' , 'mayank.ctinfotech@gmail.com']

            let pdf_link = ''
            if (req.file) {
                pdf_link = APP_URL + req.file.filename
            }

            const emailTemplatePath = path.resolve(__dirname, "../../views/email_pdf.ejs");
            const emailHtml = await ejs.renderFile(emailTemplatePath, { image_logo, pdf_link });
            await Promise.all(
                emails.map(async (email) => {
                    const emailOptions = {
                        to: email,
                        subject: "Krakka Form Data PDF",
                        html: emailHtml,
                    };
                    await sendEmail(emailOptions);
                })
            )
            const delete_form_data_row = await delete_form_data(user_id)

        }

        return handleSuccess(res, 200, response_message)
    } catch (error) {
        console.error(error);
        return handleError(res, 500, error.message);
    }
};


export const get_form_data_api = async (req, res) => {
    try {
        const { user_id } = req.user
        console.log(user_id, "user_id");

        const [form_data] = await get_form_data_by_user_id(user_id)

        if (form_data) {
            form_data.describe_of_land = form_data.describe_of_land ? JSON.parse(form_data.describe_of_land) : null;
            form_data.treatment_plant_details = form_data.treatment_plant_details ? JSON.parse(form_data.treatment_plant_details) : null;
            form_data.treatment_plant_status = form_data.treatment_plant_status ? JSON.parse(form_data.treatment_plant_status) : null;
            form_data.land_application_area = form_data.land_application_area ? JSON.parse(form_data.land_application_area) : null;
            form_data.tests_to_be_completed_every_service = form_data.tests_to_be_completed_every_service ? JSON.parse(form_data.tests_to_be_completed_every_service) : null;
            form_data.annual_testing = form_data.annual_testing ? JSON.parse(form_data.annual_testing) : null;
            form_data.service_procedure = form_data.service_procedure ? JSON.parse(form_data.service_procedure) : null;
            form_data.owners_details = form_data.owners_details ? JSON.parse(form_data.owners_details) : null;
            form_data.service_technician_details = form_data.service_technician_details ? JSON.parse(form_data.service_technician_details) : null;
            form_data.declaration = form_data.declaration ? JSON.parse(form_data.declaration) : null;
            form_data.pdf_file = form_data.pdf_file ? APP_URL + form_data.pdf_file : null;

        }

        return handleSuccess(res, 200, Msg.GET_FORM_DATA, form_data || null);
    } catch (error) {
        console.error(error);
        return handleError(res, 500, error.message);
    }
};




// export const add_form_data = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             describe_of_land: Joi.any().optional().allow("", null),
//             treatment_plant_details: Joi.any().optional().allow("", null),
//             treatment_plant_status: Joi.any().optional().allow("", null),
//             land_application_area: Joi.any().optional().allow("", null),
//             tests_to_be_completed_every_service: Joi.any().optional().allow("", null),
//             annual_testing: Joi.any().optional().allow("", null),
//             service_procedure: Joi.any().optional().allow("", null),
//             owners_details: Joi.any().optional().allow("", null),
//             service_technician_details: Joi.any().optional().allow("", null),
//             declaration: Joi.any().optional().allow("", null),
//         });
//         const { error, value } = schema.validate(req.body);
//         if (error) return joiErrorHandle(res, error);
//         const { describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration } = value



//         await insert_form_data(describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration)


//         return handleSuccess(res, 200, Msg.FORM_DATA_ADDED)
//     } catch (error) {
//         console.error(error);
//         return handleError(res, 500, error.message);
//     }
// };

// export const update_form_data = async (req, res) => {
//     try {
//         const schema = Joi.object({
//             form_service_id: Joi.number().required(),
//             describe_of_land: Joi.any().optional().allow("", null),
//             treatment_plant_details: Joi.any().optional().allow("", null),
//             treatment_plant_status: Joi.any().optional().allow("", null),
//             land_application_area: Joi.any().optional().allow("", null),
//             tests_to_be_completed_every_service: Joi.any().optional().allow("", null),
//             annual_testing: Joi.any().optional().allow("", null),
//             service_procedure: Joi.any().optional().allow("", null),
//             owners_details: Joi.any().optional().allow("", null),
//             service_technician_details: Joi.any().optional().allow("", null),
//             declaration: Joi.any().optional().allow("", null),
//         });
//         const { error, value } = schema.validate(req.body);
//         if (error) return joiErrorHandle(res, error);
//         const { describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, form_service_id } = value



//         const [form_data] = await get_form_data_by_id(form_service_id)
//         if (!form_data) {
//             return handleError(res, 404, Msg.FORM_DATA_NOT_FOUND)
//         } else {
//             await update_form_data_in_db(describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, form_service_id)
//         }

//         return handleSuccess(res, 200, Msg.FORM_DATA_UPDATED)
//     } catch (error) {
//         console.error(error);
//         return handleError(res, 500, error.message);
//     }
// };

// export const get_form_data_api = async (req, res) => {
//     try {
//         let form_data = await get_form_data()
//         return handleSuccess(res, 200, Msg.GET_FORM_DATA, form_data)
//     } catch (error) {
//         console.error(error);
//         return handleError(res, 500, error.message);
//     }
// };