const mongoose = require('mongoose');
const Review = require('./review');

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url:String,
    filename:String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace("/upload","/upload/w_200/h_100");
})

const options = { toJSON:{virtuals:true}};

const CampGroundSchema = new Schema({
    title:String,
    price:Number,
    images:[ImageSchema],
    geometry:{
        type:{
            type:String,
            enum:['Point'],
            required:true
        },
        coordinates:{
            type:[Number],
            required:true
        }
    },
    location:String,
    description:String,
    author:{
        type:Schema.Types.ObjectId,
        ref:'User'
    },
    reviews:[{
        type:Schema.Types.ObjectId,
        ref:'Review'
    }]
},options);


CampGroundSchema.virtual('properties.popupMarkup').get(function(){
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`;
})


CampGroundSchema.post('findOneAndDelete',async (doc)=>{
        if(doc){
        await Review.deleteMany({
            _id:{
                $in:doc.reviews
            }
        })

    }
})

module.exports = mongoose.model('CampGround',CampGroundSchema);