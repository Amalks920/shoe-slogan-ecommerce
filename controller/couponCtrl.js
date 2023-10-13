const couponModal = require("../model/couponModal")
const {body, validationResult}=require('express-validator')
const moment=require('moment')

const getCoupon=async(req,res,next)=>{
    res.render('user/coupon',{layout:'./layout/userLayout'})
}

const addCoupon=async(req,res,next)=>{
    try {
        res.render('admin/add-coupon',{layout:'./layout/adminLayout.ejs'})
    } catch (error) {
        res.redirect('/404')
    }
}

const addCouponPost=async(req, res,next) => {
    try {
        const validationRules = [
            body('code').notEmpty().trim().escape(),
            body('discountType').notEmpty().trim().escape(),
            body('description').notEmpty().trim().escape(),
            body('discountAmount').notEmpty().isNumeric().toFloat(),
            body('minimumAmount').notEmpty().isNumeric().toFloat(),
            body('maxRedemptions').notEmpty().isNumeric().toInt(),
            body('expirationDate').notEmpty().isISO8601().toDate(),
        ];
        
        await Promise.all(validationRules.map(validation => validation.run(req)));

                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ errors: errors.array() });
                }


          let coupon = req.body;
          
          await couponModal.create(coupon);
          res.redirect("/admin/view-coupon");
    } catch (error) {
        res.redirect('/404')
    }
  }


  

const viewCouponAdmin=async(req,res,next) => {
    try {
       const coupon=await couponModal.find({})
       let expiryDate=coupon.map((c,i)=>{
            const inputDate=c.createdAt
            const formattedDate = moment(inputDate).format("YYYY-MM-DD HH:mm:ss");
            return  c.createdAt=formattedDate
        })

  
       res.render('admin/view-coupon',
       {layout:'./layout/adminLayout.ejs',
       data:coupon,expiryDate}) 
    } catch (error) {
        console.log(error)
        res.redirect('/404')
    }
}

const getEditCoupon=async (req,res,next)=>{
    try {
        const coupon=await couponModal.findById(req.params.id);

        res.render('admin/edit-coupon',{layout:'./layout/adminLayout.ejs',
        data:coupon}) 

    } catch (error) {
        res.redirect('/404')
    }
}

const editCoupon=async (req,res,next)=>{
    const couponId=req.params.couponId
    try {
      await couponModal.updateOne({_id:couponId},req.body)
      res.redirect('/admin/view-coupon')
    } catch (error) {
        res.redirect('/404')
    }
}

const deleteCoupon=async (req,res,next)=>{
    try {
        let couponId=req.params.couponId
        await couponModal.findByIdAndDelete(couponId)
        res.redirect('/admin/view-coupon')
      } catch (error) {
        res.redirect('/404')
      }

}

module.exports={
    getCoupon,
    addCoupon,
    addCouponPost,
    viewCouponAdmin,
    getEditCoupon,editCoupon,
    deleteCoupon
}