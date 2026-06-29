import fs from "fs";

export const removeLocalFile = (path) => {
    if (path && fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
};

export const removeUploadedFiles = (req) => {
    // upload.single(...)
    if (req.file) {
        removeLocalFile(req.file.path);
    }

    // upload.fields(...)
    if (req.files) {
        Object.values(req.files).forEach((files) => {
            files.forEach((file) => {
                removeLocalFile(file.path);
            });
        });
    }
};