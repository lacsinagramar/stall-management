exports.hasAdmin = (req, res, next) => {
    console.log(req.url)
    if (req.session && req.session.admin) return next();
    else if (req.session && req.session.staff) return res.redirect('/admin?unauthorized')
    return res.redirect(`/admin/login?redirect=${req.url}`);
}
exports.hasNoAdminOrStaff = (req, res, next) => {
    if (req.session && (!req.session.admin || !req.session.staff)) return next();
    return res.redirect('/admin');
}
exports.hasAdminOrStaff = (req, res, next) => {
    if (req.session && (req.session.admin || req.session.staff)) return next();
    return res.redirect(`/admin/login?redirect=${req.url}`);
}