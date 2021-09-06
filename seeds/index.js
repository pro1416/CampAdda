const mongoose = require('mongoose');
const CampGround = require('../models/campground')
const cities = require('./cities');
const {descriptors,places} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/campAdda',{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology:true
})

const db = mongoose.connection;
db.once('open',()=>console.log("Database Connected!"))
db.on('error',()=>console.log("Error! Could not connect to database.."))

const giveRandom = (array) => array[Math.floor(Math.random()*array.length)];

const seedDB = async () =>{
    await CampGround.deleteMany({});
    for(let i=0;i<300;i++){
        let randomInt = Math.floor(Math.random() *1000);
        const price = Math.floor(Math.random()*20+10)
        const camp = new CampGround({
            title: `${giveRandom(descriptors)} ${giveRandom(places)}`,
            author:"611bcb86bfec8028c81d9756",
            price:price,
            geometry: { "type" : "Point", "coordinates" : [cities[randomInt].longitude,cities[randomInt].latitude ] },
            description:'Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem nesciunt numquam ex reprehenderit quidem! Quidem ut labore reiciendis veniam molestiae, nemo quibusdam aliquam aut pariatur distinctio harum assumenda, tenetur animi?',
            images: [
                {
                  url: 'https://res.cloudinary.com/dbnck9ntf/image/upload/v1629796808/CampAdda/cbtwzxuv8totci2r750x.jpg',
                  filename: 'CampAdda/cbtwzxuv8totci2r750x'
                },
                {
                  url: 'https://res.cloudinary.com/dbnck9ntf/image/upload/v1629462161/CampAdda/synq36ubvbc475hpeoam.jpg',
                  filename: 'CampAdda/synq36ubvbc475hpeoam'
                }
              ],
            location:`${cities[randomInt].city}, ${cities[randomInt].state}`
        })

        await camp.save();

   }
}

seedDB().then(()=>mongoose.connection.close());