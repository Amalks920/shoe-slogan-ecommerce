const addressModal = require("../model/addressModal");
const cartModal = require("../model/cartModal");
const orderModal = require("../model/orderModal");
const productModal = require("../model/productModal");
const razorpay = require("../config/razorpay");
const Razorpay = require("razorpay");
const walletModal = require("../model/walletModal");
const couponModal = require("../model/couponModal");
const { findReturnedPrdoucts } = require("../helper/productsHelper");
const { createInvoice, downloadInvoicePdf } = require("../helper/orderHelper");
const easyinvoice=require('easyinvoice')
const fs=require('fs')
const { Readable } = require("stream");


const placeOrder = async (req, res, next) => {
  const userId = req.session.user._id;

  try {
    const cart = await cartModal.aggregate([
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products", 
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $project: {
          _id: 0, 
          items: {
            productId: "$products.product",
            quantity: "$products.quantity",
            price: { $arrayElemAt: ["$productDetails.price", 0] }, 
            offerPrice: { $arrayElemAt: ["$productDetails.offerPrice", 0] },
          },
        },
      },
      {
        $group: {
          _id: null, 
          items: { $push: "$items" }, 
        },
      },
      {
        $project: {
          _id: 0, 
          items: 1,
        },
      },
    ]);

   

    let address = await addressModal.findOne({ user: userId });
    address=address.address.filter((address,index)=>{
      return address.isSelected===true;
    })
    console.log(address)

    const orderProducts = cart[0].items;
    let grandTotal = req.body.totalAmountAfterCoupon;
    let paymentMode = req.body.paymentMode;
    let coupon = req?.body?.couponId;
    let discountAmount=req?.body?.discountAmount

    const order = await orderModal.create({
      user: userId,
      items: orderProducts,
      totalAmount: grandTotal,
      paymentMode: paymentMode,
      address: address,
      coupon: coupon,
      discountAmount:discountAmount
    });

    let errorMessages = [];



    const updatedProducts = await Promise.all(
      cart[0]?.items?.map(async ({ productId, quantity }) => {
        const product = await productModal.findById(productId);

        if (!product) {
          errorMessages.push({ productId, message: "Product not found" });
          return null; 
        }

        if (product.stock <= 0 || product.stock < quantity) {
          errorMessages.push({ productId, message: "Insufficient stock" });
          return null;
        }

        if (!product) {
          return { productId, message: "Product not found" };
        }

        const updatedProduct = await productModal.findByIdAndUpdate(
          productId,
          {
            $inc: { stock: -quantity }, 
          },
          { new: true } 
        );

        return product;
      })
    );

    if (errorMessages.length > 0) {
      console.log(errorMessages);
      return res.status(400).json({ errors: errorMessages });
    }

    if (paymentMode === "ONLINE") {
      const razorpay_order = await razorpay.orders.create({
        amount: order.totalAmount * 100,
        currency: "INR",
        receipt: order._id.toString(),
      });
      order.paymentData = razorpay_order;
      await order.save();

      await couponModal.updateOne(
        { _id: coupon },
        { $inc: { maxRedemptions: -1 } }
      );
      await cartModal.deleteOne({ user: req.session.user._id });
      return res
        .status(200)
        .json({ success: true, url: `/razor-pay?oid=${order._id}` });
    }

    if (paymentMode === "WALLET") {
      const wallet = await walletModal.updateOne(
        { user_id: req.session.user._id },
        { $inc: { amount: -order.totalAmount } }
      );
    }

    await couponModal.updateOne(
      { _id: coupon },
      { $inc: { maxRedemptions: -1 } }
    );
    await cartModal.deleteOne({ user: req.session.user._id });
    res.status(200).json({ response: order });
  } catch (error) {
    console.log(error)
    res.redirect('/404')
  }
};

const orderPage = async (req, res, next) => {
  try {
    res.render("user/order-page.ejs", {
      layout: "./layout/homeLayout.ejs",
      isLoggedIn: true,
    });
  } catch (error) {
    res.redirect('/404')
  }
};

const viewOrders = async (req, res, next) => {
  try {
    let ORDER_PER_PAGE=3;
    let currentPage=req?.query?.page
    
    let allOrders = await orderModal.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Delivered"],
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    allOrders = allOrders.filter((order, index) => {
      return order.user == req.session.user._id;
    });
    let allOrderLength=allOrders.length
    let BTN_N0=Math.ceil(allOrderLength/ORDER_PER_PAGE)
   const orderIds=  allOrders.map((el,index)=>{
      return el._id
    })
   const orders= await orderModal.find({
      _id: { $in: orderIds }
    }).sort({_id:-1})
    .skip(currentPage*ORDER_PER_PAGE)
    .limit(ORDER_PER_PAGE)
    

    res.render("user/view-orders", {
      layout: "./layout/homeLayout.ejs",
      isLoggedIn: true,
      orders: orders,
      BTN_N0
      
    });
  } catch (error) {
    res.redirect('/404')
  }
};

const orderDetails = async (req, res, next) => {
  try {
    let orders = await orderModal
      .findById(req.params.id)
      .populate("items.productId")
      .populate("address");
    // orders.items = orders?.items.filter((item, index) => {
    //   return item.status != "Cancelled";
    // });

    req.session.order=orders
    res.render("user/order-details.ejs", {
      layout: "./layout/homeLayout.ejs",
      isLoggedIn: true,
      orders: orders,
    });
  } catch (error) {
    res.redirect('/404')
  }
};

const getOrderProducts = async (req, res, next) => {
  try {
    const order = await orderModal
      .findById(req.params.id)
      .populate("items.productId")
      .populate("user")
      .populate("address");
    console.log(order);
    res.render("admin/order-product", {
      layout: "./layout/adminLayout.ejs",
      isLoggedIn: true,
      order: order,
      req: req,
    });
  } catch (error) {
    res.redirect('/404')
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    let orderStatus = req?.body?.status;
    let userId = req.body.user;

    const order = await orderModal.findById(req?.params?.id);

    if (!order) {
      throw new Error("Order not found");
    }

    if (req?.query?.productId) {
      const itemToUpdate = order.items.find((item) =>
        item.productId.equals(req.query.productId)
      );
      let price;

      let productId = itemToUpdate?.productId;
      const product = await productModal.findById(productId);

      if (product.offerPrice === 0) {
        price = itemToUpdate.price;
        console.log(price);
        console.log("price");
      } else {
        price = product.offerPrice;
        console.log(price);
        console.log("offerprice");
      }
      if (!itemToUpdate) {
        throw new Error("Item not found in the order");
      }

      if (orderStatus === "Cancelled") {
        const order = await orderModal
          .findById(req.params.id)
          .populate("coupon");

        let totalAmount = 0;

        let discountAmount = order?.coupon?.discountAmount;

        if (!discountAmount) discountAmount = 0;

        let cancelledQty = itemToUpdate.quantity - req.body.qty;

        const notCancelledArr = order.items.filter((item, index) => {
          return item.status != "Cancelled";
        });

        if (req?.body?.qty != 0) {
          if (order?.coupon) {
            totalAmount =
              Number(cancelledQty) * Number(price) -
              discountAmount / req.body.qty;
          } else {
            totalAmount = Number(cancelledQty) * Number(price);
          }
          itemToUpdate.quantity = req.body.qty;
          const updated = await orderModal.updateOne(
            { _id: order._id },
            { $inc: { totalAmount: -Number(totalAmount) } }
          );

        } else if (notCancelledArr.length === 1) {
          itemToUpdate.status = orderStatus;
          await orderModal.updateOne(
            { _id: order._id },
            { orderStatus: orderStatus }
          );
        } else {
          itemToUpdate.status = "Cancelled";

          if (order?.coupon) {
            totalAmount =
              Number(cancelledQty) * Number(price) -
              discountAmount / order.items.length;
            //  totalAmount=(itemToUpdate.price*req.body.qty)-(discountAmount/req.body.qty)
          } else {
            totalAmount = Number(cancelledQty) * Number(price);
          }
          itemToUpdate.quantity = req.body.qty;
          const updated = await orderModal.updateOne(
            { _id: order._id },
            { $inc: { totalAmount: -Number(totalAmount) } }
          );
     
        }

        let walletAmountAdd;

        if (
          order?.paymentMode === "ONLINE" ||
          order?.paymentMode === "WALLET"
        ) {
          if (order?.coupon)
            walletAmountAdd =
              cancelledQty * price - discountAmount / order.items.length;
          else walletAmountAdd = cancelledQty * price;
          

          const wallet = await walletModal.updateOne(
            { user_id: req.session.user._id },
            { $inc: { amount: walletAmountAdd } }
          );
        }
      }
    } else {
      order.items.forEach((item) => {
        item.status = orderStatus;
      });

      if (orderStatus === "Cancelled") {
        if (order.paymentMode === "ONLINE" || order.paymentMode === "WALLET") {
          const wallet = await walletModal.updateOne(
            { user_id: userId },
            { $inc: { amount: order.totalAmount } }
          );
        }
      }
      await orderModal.findByIdAndUpdate(req.params.id, {
        orderStatus: orderStatus,
      });
    }
    await order.save();
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.redirect('/404')
  }
};

const viewOrdersAdmin = async (req, res, next) => {
  try {
    const ITEMS_PER_PAGE = 4;
    let ITEMS_TO_SKIP;
    if (req.query.page) {
      ITEMS_TO_SKIP = req.query.page * ITEMS_PER_PAGE;
    } else {
      ITEMS_TO_SKIP = 0;
    }

    const findOrders = await orderModal.find({
      orderStatus: { $nin: ["Delivered", "Cancelled"] },
    });
    const noOfDocuments = findOrders.length / ITEMS_PER_PAGE;

    const orders = await orderModal.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Delivered", "Cancelled"],
          },
        },
      },
      {
        $lookup: {
          from: "users", 
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $project: {
          user: { $arrayElemAt: ["$user.username", 0] },
          user: { $arrayElemAt: ["$user._id", 0] },
          orderStatus: 1,
          paymentMode: 1,
          totalAmount: 1,
          isPaid: 1,
          productcount: { $size: "$items" },
          address:1
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
      {
        $skip: ITEMS_TO_SKIP,
      },
      {
        $limit: ITEMS_PER_PAGE,
      },
    ]);

  

    res.render("admin/view-orders", {
      layout: "./layout/adminLayout.ejs",
      orders: orders,
      documentsNo: noOfDocuments,
      req
    });
  } catch (error) {
    res.redirect('/404')
  }
};

const editOrder = async (req, res, next) => {
  try {
    const updatedOrder = await orderModal.updateOne(
      { _id: req.body.orderId },
      { $set: { orderStatus: req.body.selectedStatus } }
    );
    res.status(200).json({ msg: "success" });
  } catch (error) {
    res.redirect('/404')
  }
};



const viewDeliveredOrders= async (req,res,next) => {
  let userId=req.session.user._id
  try {
    const ITEMS_PER_PAGE=3;
    const currentPage=req?.query?.page;
    let BTN_NO;
    const orders=await orderModal.find({user:userId,orderStatus:'Delivered'})
   BTN_NO=Math.ceil(orders.length/ITEMS_PER_PAGE);

    res.render('user/delivered-orders',{layout:'./layout/homeLayout.ejs',
    isLoggedIn:true,orders:orders,BTN_NO:BTN_NO
  })
  } catch (error) {
    res.redirect('/404')
  }
}

const viewDeliveredProducts=async (req,res,next)=>{
  try {
    let ITEMS_PER_PAGE=3;
    let currentPage=req?.query?.page;
    
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const order = await orderModal
    .findOne({_id:req.params.orderId,createdAt:{$gte:sevenDaysAgo}})
    .populate("items.productId")
    .populate("user")
    .populate("address")

    
    

    res.render('user/deliveredProducts.ejs',{layout:'./layout/homeLayout.ejs'
    ,order:order,isLoggedIn:true})
  } catch (error) { 
    res.redirect('/404')
  }
}

const returnProduct=async(req,res,next)=>{
  let orderId=req.query.orderId;
  let productId=req.query.productId;
  try {
    await orderModal.findOneAndUpdate(
      {
        _id:orderId,
        'items.productId':productId
      },
      {
        $set: {
          'items.$.isReturned':true
        }
      },
      {
        new:true
      }
    )
    res.status(200).json({response:true});

  } catch (error) {
    res.redirect('/404')

  }
}

const returnedProducts=async(req,res,next)=>{
  try {
    const returnedProducts= await findReturnedPrdoucts()
    res.render('admin/returnedProducts',
    {layout:'./layout/adminLayout.ejs',products:returnedProducts})
  } catch (error) {
      res.redirect('/404')

  }


}



const downloadInvoice = async (req, res, next) => {
    const order=req.session.order;
    const file=await downloadInvoicePdf(order)
    res.download(file)
};


module.exports = {
  placeOrder,
  getOrderProducts,
  orderPage,
  viewOrders,
  editOrder,
  orderDetails,
  cancelOrder,
  viewOrdersAdmin,
  viewDeliveredOrders,
  viewDeliveredProducts,
  returnProduct,
  returnedProducts,
  downloadInvoice
};
