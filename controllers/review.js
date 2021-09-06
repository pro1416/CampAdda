const Review = require("../models/review");
const CampGround = require("../models/campground");

module.exports.createReview = async(req,res,next)=>{
    const {id} = req.params;
    const newReview = new Review(req.body.review);
    const campground  = await CampGround.findById(id);
    newReview.author = req.user._id;
    campground.reviews.push (newReview);
    await newReview.save();
    await campground.save();
    req.flash('success','Succesfully added a review')
    res.redirect(`/campgrounds/${id}`);
  };

  module.exports.deleteReview = async(req,res)=>{
    const {id,reviewId} = req.params;
    await Review.findByIdAndDelete(reviewId);
    await CampGround.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    req.flash('success','Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
    
  };