import db from "../../config/db.js";


export const insert_form_data = async (
    describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, pdf_file, user_id
) => {
    try {
        const query = `INSERT INTO tbl_form_service 
            ( describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration , pdf_file , user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        // const values = [
        //     describe_of_land, treatment_plant_details, treatment_plant_status, land_application_area, tests_to_be_completed_every_service, annual_testing, service_procedure, owners_details, service_technician_details, declaration, pdf_file, user_id
        // ];

        const values = [
            JSON.stringify(describe_of_land) || null,
            JSON.stringify(treatment_plant_details) || null,
            JSON.stringify(treatment_plant_status) || null,
            JSON.stringify(land_application_area) || null,
            JSON.stringify(tests_to_be_completed_every_service) || null,
            JSON.stringify(annual_testing) || null,
            JSON.stringify(service_procedure) || null,
            JSON.stringify(owners_details) || null,
            JSON.stringify(service_technician_details) || null,
            JSON.stringify(declaration) || null,
            pdf_file || null,
            user_id
        ];

        const result = await db.query(query, values);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to insert form data.");
    }
};

export const update_form_data_in_db = async (
    describe_of_land,
    treatment_plant_details,
    treatment_plant_status,
    land_application_area,
    tests_to_be_completed_every_service,
    annual_testing,
    service_procedure,
    owners_details,
    service_technician_details,
    declaration,
    pdf_file,
    form_service_id
) => {
    try {
        const query = `UPDATE tbl_form_service SET 
            describe_of_land = ?, 
            treatment_plant_details = ?, 
            treatment_plant_status = ?, 
            land_application_area = ?, 
            tests_to_be_completed_every_service = ?, 
            annual_testing = ?, 
            service_procedure = ?, 
            owners_details = ?, 
            service_technician_details = ?, 
            declaration = ? ,
            pdf_file = ? 
        WHERE form_service_id = ?`;

        // const values = [
        //     describe_of_land,
        //     treatment_plant_details,
        //     treatment_plant_status,
        //     land_application_area,
        //     tests_to_be_completed_every_service,
        //     annual_testing,
        //     service_procedure,
        //     owners_details,
        //     service_technician_details,
        //     declaration,
        //     pdf_file,
        //     form_service_id
        // ];

        const values = [
            JSON.stringify(describe_of_land) || null,
            JSON.stringify(treatment_plant_details) || null,
            JSON.stringify(treatment_plant_status) || null,
            JSON.stringify(land_application_area) || null,
            JSON.stringify(tests_to_be_completed_every_service) || null,
            JSON.stringify(annual_testing) || null,
            JSON.stringify(service_procedure) || null,
            JSON.stringify(owners_details) || null,
            JSON.stringify(service_technician_details) || null,
            JSON.stringify(declaration) || null,
            pdf_file || null,
            form_service_id
        ];


        const result = await db.query(query, values);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update form data.");
    }
};

export const get_form_data = async () => {
    try {
        const query = `SELECT *  FROM tbl_form_service ORDER BY created_at DESC`;
        const result = await db.query(query);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update storage data.");
    }
};

export const get_form_data_by_user_id = async (user_id) => {
    try {
        const query = `SELECT *  FROM tbl_form_service WHERE user_id = ?`;
        const result = await db.query(query, [user_id]);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update storage data.");
    }
};

export const get_form_data_by_id = async (form_service_id) => {
    try {
        const query = `SELECT *  FROM tbl_form_service WHERE form_service_id = ? `;
        const result = await db.query(query, [form_service_id]);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update storage data.");
    }
};

export const delete_form_data = async (user_id) => {
    try {
        const query = `DELETE FROM tbl_form_service  WHERE user_id = ? `;
        const result = await db.query(query, [user_id]);
        return result;
    } catch (error) {
        console.error("Database Error:", error.message);
        throw new Error("Failed to update storage data.");
    }
};






