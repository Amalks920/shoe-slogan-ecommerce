const expressAsyncHandler = require("express-async-handler");
const sharp = require("sharp");
const Category = require("../model/categoryModal");
const categoryModal = require("../model/categoryModal");
const url = require("url");

const addCategory = expressAsyncHandler(async (req, res, next) => {
  try {
    const allCategory = await categoryModal.find({});
    res.render("admin/add-category", {
      layout: "./layout/adminLayout.ejs",
      data: allCategory,
      req: req,
    });
  } catch (error) {
    res.redirect("/404");
  }
});

const addCategoryPost = async (req, res) => {
  const { productCategory, categoryDescription } = req.body;

  const data = {
    productCategory: productCategory,
    categoryDescription: categoryDescription,
  };

  data.images = [];
  console.log(req.files);
  if (req.files.length > 0) {
    for (let file of req.files) {
      const imageName = `cropped_${file.filename}`;
      await sharp(file.path)
        .resize(500, 600, { fit: "cover" })
        .toFile(`./public/images/uploads/${imageName}`);

      data.images[0] = imageName;
    }
    // category.images = images;
  } else {
    return res
      .status(400)
      .json({ success: false, message: "Please choose product image files" });
  }

  try {
    // Check if the category already exists
    const existingCategory = await Category.findOne({ productCategory });
    console.log(existingCategory);
    if (existingCategory) {
      return res.redirect(
        url.format({
          pathname: "/admin/add-category",
          query: {
            err: "category already exists",
          },
        })
      );
    }

    const category = await Category.create(data);
    if (category) {
      const allCategories = await Category.find();
      return res.redirect("/admin/category/view-category");
    }
  } catch (err) {
    res.redirect("/404");
  }
};

const viewCategory = async (req, res, next) => {
  try {
    const allCategory = await categoryModal.find({});
    res.render("admin/view-category", {
      layout: "./layout/adminLayout.ejs",
      data: allCategory,
    });
  } catch (error) {
    res.redirect("/404");
  }
};

const getEditCategory = async (req, res, next) => {
  try {
    const category = await categoryModal.findById(req.params.id);
    res.render("admin/edit-category", {
      layout: "./layout/adminLayout.ejs",
      data: category,
    });
  } catch (error) {
    res.redirect("/404");
  }
};

const editCategoryPost = async (req, res, next) => {
  try {
    const category = req.body;
    const categoryId = req.params.id;

    const images = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const imageName = `cropped_${file.filename}`;

        await sharp(file.path)
          .resize(500, 600, { fit: "cover" })
          .toFile(`./public/images/uploads/${imageName}`);

        images.push(imageName);
      }
    }
    await categoryModal.findByIdAndUpdate(
      categoryId,
      { images: images },
      { new: true }
    );
    const updatedCategory = await categoryModal.findById(categoryId);
    updatedCategory.productCategory = req.body.productCategory;
    updatedCategory.categoryDescription = req.body.categoryDescription;
    await updatedCategory.save();
    res.redirect("/admin/category/view-category");
  } catch (error) {
    res.redirect("/404");
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const deletedCategory = await categoryModal.findByIdAndDelete(
      req.params.id
    );
    res.status(201).send(req.params.id);
  } catch (error) {
    res.redirect("/404");
  }
};

module.exports = {
  addCategory,
  addCategoryPost,
  viewCategory,
  getEditCategory,
  editCategoryPost,
  deleteCategory,
};
