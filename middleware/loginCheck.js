const { LoginOutModel } = require('../model/resModel')

module.exports = (req, res, next) => {
    if (req.session.username) {
        next()
        return
    }
    res.json(
        new LoginOutModel('未登录')
    )
}