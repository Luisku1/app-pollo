import { Jwt } from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

    const token = req.cookies.acces_token

    if(!token) return next(errorHandler(401, 'Unauthorized'))

    Jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

        if (err) return next(ErrorHandler(403, 'Forbidden'))

        req.user = user

        next()
    })


}