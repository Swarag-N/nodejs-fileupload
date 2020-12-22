const express = require("express");
const router = express.Router();
const formidable = require("formidable");
const middleware = require("../middleware/index");
const fs = require("fs");

const path = require("path");
const helper = require("../helpers/StorageModel");
const Employee = require("../model/Employee");

router.use(middleware.isLoggedIn);

router.get("/", (request, response) => {
  Employee.find({ admin: request.user }, (err, employees) => {
    if (err) throw err;
    response.render("app/index", {
      currentUser: request.user,
      emp: employees,
    });
  });
});

router.get("/test", (req, res) => {
  res.send(`
      <h2>With <code>"express"</code> npm package</h2>
      <form action="/app/upload" enctype="multipart/form-data" method="post">
        <div>Text field title: <input type="text" name="title" /></div>
        <div>File: <input type="file" name="someExpressFiles" multiple="multiple" /></div>
        <input type="submit" value="Upload" />
      </form>
    `);
});

router.get("/upload", (req, res) => {
  res.render("forms/upload", { currentUser: req.user });
});

router.post("/upload", (req, res, next) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
    uploadDir: path.resolve(__dirname, ".."),
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err);
      return;
    }
    // res.json({ fields, files });
  });

  form.on("fileBegin", function (name, file) {
    //rename the incoming file to the file's name
    console.log(`Verifying ${file.name}`);
    if (helper.verifyName(file.name)) {
      let id = req.user._id;
      let Eid = file.name.split(".")[0];
      file.path = path.join(form.uploadDir, "uploads", file.name);

      Employee.create(
        { admin: req.user, eid: Eid, file: file.path },
        (err, emp) => {
          if (err) throw err;
        }
      );
    } else {
      file.path = path.join(form.uploadDir, "temp", file.name);
    }
  });

  form.on("file", function (name, file) {
    console.log("Uploaded " + file.name);
  });

  form.once("end", () => {
    res.redirect("/app");
  });
});

router.get("/download/:id", (req, res) => {
  Employee.findById(req.params.id, (err, foundEmp) => {
    if (err) throw err;
    if (foundEmp) {
      res.download(foundEmp.file);
    }
  });
});

router.get("/delete/:id", (req, res) => {
  Employee.findByIdAndDelete(req.params.id, (err, foundEmp) => {
    if (err) throw err;
    if (foundEmp) {
      try {
        fs.unlinkSync(foundEmp.file);
        //file removed
      } catch (err) {
        console.error(err);
      }
    }
    res.redirect('/app')
  });
});

module.exports = router;
