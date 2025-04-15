import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/')); 
    },
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`); 
    },
});

export const upload = multer({ storage: storage });
export const uploadFile = upload.single('file');
export const uploadXML = upload.single('xml');

export const uploadFormFiles = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'xml', maxCount: 1 },
  ]);
  