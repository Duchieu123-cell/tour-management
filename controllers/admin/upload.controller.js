module.exports.imagePost = async (req, res) => {
  console.log(req.file.path);
  res.json({
    location: req.file.path
  });
}