import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)
        return null;
    }
}

const deleteFromCloudinary = async (fileUrl, resourceType = "image") => {
    try {
        if (!fileUrl) return null

        // FIX: old split-based extraction broke for files inside folders.
        // e.g. ".../upload/v1234567/videos/abc123.mp4" → public_id = "videos/abc123"
        // Regex grabs everything between "/upload/v<digits>/" and the file extension.
        const matches = fileUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)

        if (!matches?.[1]) {
            console.log("Could not extract public_id from URL:", fileUrl)
            return null
        }

        const publicId = matches[1]

        const response = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        })

        return response
    } catch (error) {
        console.log("Error while deleting file from cloudinary", error)
        return null
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}