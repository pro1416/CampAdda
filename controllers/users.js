const User = require('../models/user');

module.exports.renderRegisterForm = (req,res)=>{
    res.render('users/register.ejs');
};

module.exports.createUser = async (req,res,next)=>{
    try{
    const {username,password,email} = req.body;
    const user = new User({email,username});
    const newUser = await User.register(user,password);
    req.login(newUser,(err)=>{
        if(err) return next(err);
        req.flash("success","Welcome to CampAdda !");
        res.redirect('/campgrounds');
    })
   
    }catch(e){
        req.flash("error",e.message);
        res.redirect('/register');
    }
};

module.exports.renderLoginForm = (req,res)=>{
    res.render('users/login.ejs');
};

module.exports.loginUser = (req,res)=>{
    req.flash("success","Welcome Back !");
    const returnUrl = req.session.returnToUrl || '/campgrounds';
    res.redirect(returnUrl);
    delete req.session.returnToUrl;
};

module.exports.logoutUser = (req,res)=>{
    req.logOut();
    req.flash("success","Logged out");
    res.redirect('/campgrounds');
};