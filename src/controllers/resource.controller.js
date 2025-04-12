import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Resource } from '../models/resource.model.js';
import { Subject } from "../models/subject.model.js";
import { uploadOnCloudinary } from '../utils/cloudinary.js';



const createResource = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { name, subjectId } = req.body;

    if (role != 'teacher' && role != 'admin') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if ([name, subjectId].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const subject = await Subject.findOne({subjectId});

    const resourceLocalPath = req.files?.resource[0]?.path;

    if (!resourceLocalPath) {
        throw new ApiError(400, "Resource file is required")
    }

    const resource = await uploadOnCloudinary(resourceLocalPath)

    if (!resource) {
        throw new ApiError(400, "Error while uploading Resource")
    }

    const createdResource = await Resource.create({
        name,
        resource: resource.secure_url,
        resourcePublicId: resource.public_id,
        subject: subject?._id,
        uploadedBy: req.user?._id
    })

    if (!createdResource) {
        throw new ApiError(500, "Something went wrong while creating the resource");
    }

    return res.status(201).json(
        new ApiResponse(200, createdResource, "Resource created Successfully")
    )

})
const getResourcesBySubject = asyncHandler(async (req, res) => {

    const { subjectId } = req.body;

    if (!subjectId) {
        throw new ApiError(400, "SubjectId is required");
    }
    const subject = await Subject.findOne({subjectId});
    const resources = await Resource.find({ subject: subject?._id })
        .sort({ createdAt: -1 });                                   //latest comes first

    return res.status(200).json(
        new ApiResponse(200, resources, "Resources fetched successfully")
    );

})
const updateResource = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { resourceId } = req.params;
    const { name } = req.body;

    if (!['teacher', 'admin'].includes(role)) {
        throw new ApiError(403, "Unauthorized access");
    }

    if (!resourceId) {
        throw new ApiError(400, "Resource ID is required");
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
        throw new ApiError(404, "Resource not found");
    }

    const resourceLocalPath = req.files?.resource?.[0]?.path;
    let resourceFile;
    if (resourceLocalPath) {
        resourceFile = await uploadOnCloudinary(resourceLocalPath);
        if (!resourceFile) {
            throw new ApiError(400, "Error while uploading on resourceFile")
        }
        if (resource?.resourcePublicId) {
            const isResourceDeleted = await deleteFromCloudinary(resource?.resourcePublicId)
            if (!isResourceDeleted) {
                throw new ApiError(400, "Error while deleting resourceFile")
            }
        }
    }

    const updateFields = {
        ...(name && { name }),
        ...(resourceFile?.secure_url && { resource: resourceFile.secure_url }),
        ...(resourceFile?.public_id && { resourcePublicId: resourceFile.public_id })
    }

    const updatedResource = await Resource.findByIdAndUpdate(
        resource._id,
        {
            $set: {
                ...updateFields
            }
        },
        { new: true }
    )
    return res.status(200).json(
        new ApiResponse(200, updatedResource, "Resource updated Successfully")
    )
})
const deleteResource = asyncHandler(async (req, res) => {
    const role = req.user.role;
    const { resourceId } = req.params;

    if (role != 'teacher' && role != 'admin') {
        throw new ApiError(403, "Unauthorized Access");
    }

    if (!resourceId) {
        throw new ApiError(400, "ResourceId is required");
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
        throw new ApiError(404, "Resource not found");
    }

    if (resource?.resourcePublicId) {
        const isResourceDeleted = await deleteFromCloudinary(resource?.resourcePublicId)
        if (!isResourceDeleted) {
            throw new ApiError(400, "Error while deleting Resource from Cloudinary")
        }
    }

    await Resource.findByIdAndDelete(resourceId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Resource is deleted Successfully")
    )
})



export {
    createResource,
    getResourcesBySubject,
    updateResource,
    deleteResource,
}