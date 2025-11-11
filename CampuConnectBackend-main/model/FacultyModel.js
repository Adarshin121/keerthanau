const facultySchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  department: String,
  designation: String,
  phone: String,
  role: { type: String, default: "faculty" }
});

module.exports = mongoose.model("faculty", facultySchema);
