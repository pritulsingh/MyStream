import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
        // path.parse("tutorial.mp4").name  →  "tutorial"
        // path.extname("tutorial.mp4")     →  ".mp4"
        const name = path.parse(file.originalname).name
        const ext = path.extname(file.originalname)
        cb(null, name + "-" + uniqueSuffix + ext)
    }
})

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
})