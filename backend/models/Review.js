const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    itemId: {
        type: String,
        required: [true, 'Item ID is required'],
        trim: true
    },
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true
    },
    reviewText: {
        type: String,
        required: [true, 'Review text is required'],
        minlength: [10, 'Review must be at least 10 characters'],
        maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        default: null
    },
    status: {
        type: String,
        enum: ['PENDING', 'APPROVED', 'REJECTED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// CRITICAL: Compound unique index to prevent duplicate reviews
// A user can only submit ONE review per item
reviewSchema.index({ userId: 1, itemId: 1 }, { unique: true });

// Populate user info when querying
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'userId',
        select: 'username email'
    });
    next();
});

module.exports = mongoose.model('Review', reviewSchema);
