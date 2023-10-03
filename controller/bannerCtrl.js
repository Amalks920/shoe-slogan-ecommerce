const bannerModal=require('../model/bannerModal'); 
const sharp = require('sharp');
const offerModal = require('../model/offerModal');
const { default: mongoose } = require('mongoose');

const getBannerManagementPage=async(req,res,next)=>{
    try {
        const banners=await bannerModal.find({});
        const productOffers=await offerModal.find({})
        res.render('admin/banner',{layout:'./layout/adminLayout.ejs',productOffers:productOffers,banner:banners})
    } catch (error) {
      res.redirect('/404')
    }
}

const addBannerPost= async (req, res) => {
    const { bannername,offer } = req.body;
    let images = req.files[0].filename
            let imageName = `cropped_${images}`;
      await sharp(`./public/images/uploads/${images}`)
          .resize(1200, 1000, { fit: "cover" })
          .toFile(`./public/images/uploads/${imageName}`); 
      images=imageName  
    try {
      
      const banner = await bannerModal.create({bannername,images,offer});
      if (banner) {
        const allBanners = await bannerModal.find(); 
        res.redirect("/admin/banner-management");
      }
       } catch (err) {
        res.redirect('/404')
    }
    
  }


const getEditBanner=async(req,res,next)=>{
  try {
      const banners=await bannerModal.findById(req.params.bannerId);
      const productOffers=await offerModal.find({})
      res.render('admin/edit-banner',{layout:'./layout/adminLayout.ejs',productOffers:productOffers,banner:banners})
  } catch (error) {
    res.redirect('/404')
  }
}

const editBanner=async (req, res) => {
  try {
    console.log(req.body)
    const banner = await bannerModal.findById(req.params.bannerId);
    if (!banner) {
      return res.status(404).send('Banner not found');
    }

    const { bannername,offer } = req.body;
    
    let images = req.files[0].filename
            let imageName = `cropped_${images}`;
      await sharp(`./public/images/uploads/${images}`)
          .resize(1200, 1000, { fit: "cover" })
          .toFile(`./public/images/uploads/${imageName}`); 
      images=imageName  

      let updateFields={
        offer:new mongoose.Types.ObjectId(offer),
        bannername:bannername,
        images:images
      }

await bannerModal.findOneAndUpdate({ _id: req.params.bannerId }, updateFields, { new: true });

    res.redirect('/admin/banner-management');
  } catch (error) {
    res.redirect('/404')
  }
}



module.exports={
    getBannerManagementPage,
    addBannerPost,getEditBanner,
    editBanner
}