exports.hasAdmin = (req, res, next) => {
    console.log(req.url)
    if (req.session && req.session.admin) return next();
    return res.redirect(`/admin/login?redirect=${req.url}`);
}
exports.hasNoAdmin = (req, res, next) => {
    if (req.session && !req.session.admin) return next();
    return res.redirect('/admin');
}