const orderModal = require("../model/orderModal")

const findCategoryWiseOrders=()=>{

    return new Promise(async (resolve,reject)=>{
        try {
            const orders = await orderModal.aggregate([
                {
                    $match:{
                        orderStatus:"Delivered"
                    }
                },
                {
                  $unwind: '$items' // Unwind the items array
                },
                {
                  $lookup: {
                    from: 'products', // Adjust the collection name as needed
                    localField: 'items.productId',
                    foreignField: '_id',
                    as: 'product'
                  }
                },
                {
                  $unwind: '$product' // Unwind the product array
                },
                {
                  $lookup:{
                    from:'categories',
                    localField:'product.productCategory',
                    foreignField:'_id',
                    as:"category"
                  }
                },
                {
                  $unwind: '$category' // Unwind the category array
                },
                {
                  $group: {
                    _id: '$category.productCategory', // Group by category
                    totalRevenue: { $sum: {$multiply:['$product.price','$items.quantity']} } // Calculate the sum of totalAmount
                  }
                }
              ]);
            
            resolve(orders)
            
        } catch (error) {
            reject(error)
        }

    })

   
  
}


module.exports={
    findCategoryWiseOrders
}