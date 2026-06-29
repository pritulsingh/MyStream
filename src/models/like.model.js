import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
}, { timestamps: true })

// FIX: compound unique indexes prevent duplicate like documents
// even if two requests arrive at the exact same millisecond.
// Without this, the findOne → create flow has a race condition window
// where both requests see no existing like and both create one.
// sparse: true is required because video/comment/tweet are all optional
// fields — without it, MongoDB treats two docs with video: null as
// duplicates and rejects the second one.
likeSchema.index(
    { video: 1, likedBy: 1 },
    {
        unique: true,
        partialFilterExpression: {
            video: { $type: "objectId" }
        }
    }
)

likeSchema.index(
    { comment: 1, likedBy: 1 },
    {
        unique: true,
        partialFilterExpression: {
            comment: { $type: "objectId" }
        }
    }
)

likeSchema.index(
    { tweet: 1, likedBy: 1 },
    {
        unique: true,
        partialFilterExpression: {
            tweet: { $type: "objectId" }
        }
    }
)

likeSchema.plugin(mongooseAggregatePaginate)

export const Like = mongoose.model("Like", likeSchema)