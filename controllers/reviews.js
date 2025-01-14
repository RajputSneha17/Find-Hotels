const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
  
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    console.log(newReview);
  
    listing.reviews.push(newReview);
  
    await newReview.save();
    await listing.save();
  
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing.id}`);
};

module.exports.deleteReview = async (req, res) => { 
    const { id, reviewId } = req.params;
  
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }
  
    const review = await Review.findById(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }
  
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
  
    req.flash("success", "Review Deleted Successfully!!");
    res.redirect(`/listings/${id}`);
};
