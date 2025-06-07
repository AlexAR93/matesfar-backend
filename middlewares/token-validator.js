const jwt= require("jsonwebtoken");

const tokenValidator=(req, res, next)=>{
    
    const token = req.header('x-token');
    if(!token){
        return res.status(401).json({
            ok:false,
            msg:'not token in petition'
        })
    }
    try {
        const {uid,name}=jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );
        
        req.uid=uid;
        req.name=name;
        
    } catch (error) {
        return res.status(401).json({
            ok:false,
            msg:'invalid token'
        })
    }

    next();
}

module.exports=tokenValidator;