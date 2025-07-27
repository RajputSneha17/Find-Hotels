const Listing = require("../models/listing");

// Index Route
module.exports.index = async (req, res) => {
    const { search } = req.query;
    let allListings;

    if (search) {
        // Search by title (case-insensitive)
        const regex = new RegExp(search, 'i');
        allListings = await Listing.find({ title: regex });
    } else {
        allListings = await Listing.find({});
    }

    res.render("index.ejs", { allListings });
};

// New Route
module.exports.renderNewForm = async (req, res) => {
    res.render("new.ejs");
};

// Show Route
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
};

// Create Route
module.exports.createListing = async (req, res, next) => {
    const newListing = new Listing(req.body.listing);
    let url = req.file.path;
    let filename =  req.file.filename;
    newListing.image = {url, filename};
    newListing.owner = req.user._id;
    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
};

// Delete Route
module.exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;
        await Listing.findByIdAndDelete(id);
        req.flash("success", "Listing Deleted Successfully!");
        res.redirect("/listings");
    } catch (err) {
        res.status(500).send(`Error: ${err.message}`);
    }
};

// Edit Route
module.exports.editListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    console.log("Listing:", listing);

    if (!listing) {
        req.flash("error", "Listing you requested for does not exist");
        return res.redirect("/listings");
    }


    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_250");
    res.render("edit.ejs", { listing, originalImageUrl });
};

// Update Route
module.exports.putListing = async (req, res) => {
    const { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !== "undefined"){
        const newListing = new Listing(req.body.listing);
        let url = req.file.path;
        let filename =  req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Edited Successfully!");
    res.redirect(`/listings/${id}`);
};
