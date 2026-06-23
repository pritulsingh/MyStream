import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        const likesCount = await Like.countDocuments({ video: videoId })

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false, likesCount }, "Video unliked successfully"))
    }

    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    const likesCount = await Like.countDocuments({ video: videoId })

    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, likesCount }, "Video liked successfully"))
})


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        const likesCount = await Like.countDocuments({ comment: commentId })

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false, likesCount }, "Comment unliked successfully"))
    }

    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    const likesCount = await Like.countDocuments({ comment: commentId })

    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, likesCount }, "Comment liked successfully"))
})


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    // FIX: tweet existence check added — previously a like could be created
    // for a tweet that never existed or was already deleted
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        const likesCount = await Like.countDocuments({ tweet: tweetId })

        return res
            .status(200)
            .json(new ApiResponse(200, { liked: false, likesCount }, "Tweet unliked successfully"))
    }

    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    const likesCount = await Like.countDocuments({ tweet: tweetId })

    return res
        .status(200)
        .json(new ApiResponse(200, { liked: true, likesCount }, "Tweet liked successfully"))
})


const getLikedVideos = asyncHandler(async (req, res) => {
    // FIX: paginated — previously returned every liked video in one response.
    // A user with 5000 liked videos would get all 5000 at once.
    const { page = 1, limit = 10 } = req.query

    const pipeline = [
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: { $exists: true, $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
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
                    { $match: { isPublished: true } },
                    {
                        $project: {
                            videoFile: 1,
                            thumbnail: 1,
                            title: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            createdAt: 1,
                            owner: "$ownerDetails"
                        }
                    }
                ]
            }
        },
        { $unwind: "$videoDetails" },
        { $sort: { createdAt: -1 } },
        { $replaceRoot: { newRoot: "$videoDetails" } }
    ]

    const likeAggregate = Like.aggregate(pipeline)

    const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10
    }

    const likedVideos = await Like.aggregatePaginate(likeAggregate, options)

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}