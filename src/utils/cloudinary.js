import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // fs-> file system(provided by nodejs)

// cloudinary configuartion. Cloudinary is a 3rd party app
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload the file on cloudinary
    // 2nd param provides upload options
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded successfully
    //console.log("File is uploaded on cloudinary", response.url); // response.url is the public url recieved after the resource is uploaded in server

    //console.log(response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // if not uploaded or the operation got failed, we remove the locally saved temporary file as the upload
    // operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteOnCloudinary = async (localFilePath) =>{
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader
    .destroy(localFilePath)
    .then(result => console.log(result));
    fs.unlinkSync(localFilePath)
    return response;
  }
  catch (error) {
    console.log(error);
  }
}
export { uploadOnCloudinary,deleteOnCloudinary };
