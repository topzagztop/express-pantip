const authenticate = (req, res, next) => {
    req.user = { id: 1 };
    
    next();
}

module.exports = authenticate