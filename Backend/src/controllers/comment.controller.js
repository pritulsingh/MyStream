import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

    if (!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video id")
    }

    const videoExists = await Video.findById(videoId)
    if (!videoExists) {
        throw new ApiError(404, "Video not found")
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $unwind: "$ownerDetails" },
        { $sort: { createdAt: -1 } },
        {
            $project: {
                content: 1,
                createdAt: 1,
                updatedAt: 1,
                owner: {
                    _id: "$ownerDetails._id",
                    username: "$ownerDetails.username",
                    fullName: "$ownerDetails.fullName",
                    avatar: "$ownerDetails.avatar"
                }
            }
        }
    ]

    const commentAggregate = Comment.aggregate(pipeline)

    // FIX 1: Number(page) || 1 instead of parseInt(page, 10)
    // parseInt("abc", 10) returns NaN which breaks pagination math.
    // Number("abc") also returns NaN but || 1 immediately falls back to the
    // default, so ?page=abc silently becomes page=1 instead of crashing.
    const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10
    }

    const comments = await Comment.aggregatePaginate(commentAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!comment) {
        throw new ApiError(500, "Failed to add comment, please try again")
    }

    // FIX 2: populate owner details before returning.
    // Raw Comment.create() only returns ObjectIds for owner/video.
    // Frontend needs username/avatar immediately to render the comment
    // without waiting for a separate fetch.
    const populatedComment = await Comment.findById(comment._id).populate(
        "owner",
        "username fullName avatar"
    )

    return res
        .status(201)
        .json(new ApiResponse(201, populatedComment, "Comment added successfully"))
})


const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You are not allowed to update this comment")
    }

    // FIX 3: use comment.save() instead of a second findByIdAndUpdate().
    // We already have the document in memory from findById() above.
    // Mutating it and calling save() is one DB round-trip instead of two.
    // Note: only the owner can edit their comment so no need for a video
    // owner exception here (editing someone else's words doesn't make sense).
    comment.content = content
    const updatedComment = await comment.save({ validateBeforeSave: true })

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))
})


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    // FIX 4: allow video owner to delete comments on their own video.
    // Previously only the comment author could delete — meaning a video owner
    // had no way to remove abusive/spam comments from their own video.
    const video = await Video.findById(comment.video)

    const isCommentOwner = comment.owner.toString() === req.user?._id.toString()
    const isVideoOwner = video?.owner.toString() === req.user?._id.toString()

    if (!isCommentOwner && !isVideoOwner) {
        throw new ApiError(403, "You are not allowed to delete this comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})


export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}