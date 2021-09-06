const campground = require("../models/campground");
const CampGround = require("../models/campground");
const mboxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mboxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mboxGeocoding({accessToken:mboxToken});
const {cloudinary} = require("../cloudinary");

module.exports.index = async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  };
;
module.exports.createCampground = async (req, res, next) => {
  const geoData = await geoCoder.forwardGeocode({
    query:req.body.campground.location,
    limit:1
  }).send();
    const newCamp = new CampGround(req.body.campground);
    newCamp.geometry = geoData.body.features[0].geometry;
    newCamp.images = req.files.map(img =>({url:img.path,filename:img.filename}));
    newCamp.author = req.user._id;
    await newCamp.save();
    req.flash('success','Successfully created camp');
    res.redirect(`/campgrounds/${newCamp._id}`);
};

module.exports.renderNewForm =  (req, res) => {
    res.render("campgrounds/new.ejs");
  };

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await CampGround.findById(id).populate({
      path:'reviews',
      populate:{
        path:'author'
      }
    }).populate('author');
    if(!campground){
      req.flash('error','Cannot find that campground');
      res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
  };

module.exports.editCampground = async (req, res) => {
    const campground = await CampGround.findById(req.params.id);
    if(!campground){
      req.flash('error','Cannot find that campground');
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", { campground });
  };

module.exports.updateCampground = async (req, res) => {
    const camp = await CampGround.findByIdAndUpdate(req.params.id,{ ...req.body.campground});
    console.log(req.body.deleteImages);
    const imgs = req.files.map(img =>({url:img.path,filename:img.filename}));
    camp.images.push(...imgs);
    await camp.save();
    if(req.body.deleteImages){
      for(let filename of req.body.deleteImages){
        console.log("deleting");
        await cloudinary.uploader.destroy(filename);
      }
      await  camp.updateOne({$pull:{images:{filename:{$in:req.body.deleteImages}}}});
    }
    
    req.flash('success','Successfully updated campground')
    res.redirect(`/campgrounds/${camp._id}`);
  };

module.exports.deleteCampground = async (req, res) => {
    await CampGround.findByIdAndDelete(req.params.id);
    req.flash('success','Successfully deleted campground')
    res.redirect("/campgrounds");
  };