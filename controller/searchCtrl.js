const categoryModal = require("../model/categoryModal");
const productModal = require("../model/productModal");

const searchPage = async (req, res, next) => {
  let sort = req?.query?.sort;
  let categories = req?.query?.category?.split(",");
  let search = req?.query?.search;
  let PAGE = req?.query?.page;
  let from = req?.query?.from;
  let to = req?.query?.to;

  const category = await categoryModal.find({});

  const allProducts = await productModal.find({ status: { $ne: "Delisted" } });
  NO_OF_PAGES = Math.ceil(allProducts.length / 9);

  try {
    let products;
    if (categories === null || !categories || categories[0] === "") {
      products = await productModal.aggregate([
        {
          $skip: PAGE * 9,
        },
        {
          $limit: 9,
        },
        {
          $match: { status: { $ne: "Delisted" } },
        },
      ]);

      categories = [];
    } else if (categories) {
      products = await productModal.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "productCategory",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $match: {
            "category.productCategory": { $in: categories },
          },
        },
        {
          $skip: PAGE * 9,
        },
        {
          $limit: 9,
        },
      ]);
      NO_OF_PAGES = Math.ceil(products.length / 9);
    }

    if (sort == "lowtohigh") {
      products = products.sort(function (a, b) {
        return a.price - b.price;
      });
    } else if (sort == "hightolow") {
      products = products.sort(function (a, b) {
        return b.price - a.price;
      });
      NO_OF_PAGES = Math.ceil(products.length / 9);
    }

    if (from && to) {
      products = products.filter((product, index) => {
        return product?.price >= from && product?.price <= to;
      });
      NO_OF_PAGES = Math.ceil(products.length / 9);
    }

    if (search) {
      products = products.filter((product, index) => {
        return product.productname.search(search) != -1;
      });
      NO_OF_PAGES = Math.ceil(products.length / 9);
    }

    req.session.filteredProducts = products;
    //  console.log(products)
    // NO_OF_PAGES=Math.ceil(products.length/9)
    console.log(NO_OF_PAGES);

    res.render("user/searchPage", {
      layout: "./layout/homeLayout",
      products: req.session.filteredProducts,
      category,
      categories,
      isLoggedIn: true,
      searchInput: search,
      NO_OF_PAGES: NO_OF_PAGES,
      req,
    });
  } catch (error) {
    res.redirect("/404");
  }
};

const filteredProducts = async (req, res, next) => {
  try {
    const filtered = await productModal.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "productCategory",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $match: {
          "category.productCategory": { $in: req.body.checkedValues },
        },
      },
      {
        $limit: 9,
      },
    ]);

    res.render("user/searchPage", {
      layout: "./layout/homeLayout",
      products: filtered,
      category,
      isLoggedIn: true,
    });
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.redirect("/404");
  }
};

module.exports = {
  searchPage,
  filteredProducts,
};
