exports.index = function(req, res){
  res.render('index', {api_key: req.app.get('api_key')});
};