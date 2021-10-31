function logger (req, res, next) {
    console.log('loging...');
    next();
}

module.exports=logger