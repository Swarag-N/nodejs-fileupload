const mongoose = require('mongoose');

const EmployeeSchema = mongoose.Schema({
    eid:String,
	admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Admin"
    },
    file:String
});

module.exports = mongoose.model("Employee",EmployeeSchema);