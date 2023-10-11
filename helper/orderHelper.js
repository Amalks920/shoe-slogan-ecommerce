var easyinvoice = require('easyinvoice');
const fs=require('fs')
const puppeteer = require("puppeteer");
const orderModal = require('../model/orderModal');
const productModal = require('../model/productModal');

const createInvoice=()=>{
    console.log('osdifj')
 

    return new Promise((resolve,reject)=>{


        var data = {
            // Customize enables you to provide your own templates
    // Please review the documentation for instructions and examples
    "customize": {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html 
    },
    "images": {
        // The logo on top of your invoice
        "logo": "https://public.easyinvoice.cloud/img/logo_en_original.png",
        // The invoice background
        "background": "https://public.easyinvoice.cloud/img/watermark-draft.jpg"
    },
    // Your own data
    "sender": {
        "company": "Sample Corp",
        "address": "Sample Street 123",
        "zip": "1234 AB",
        "city": "Sampletown",
        "country": "Samplecountry"
        //"custom1": "custom value 1",
        //"custom2": "custom value 2",
        //"custom3": "custom value 3"
    },
    // Your recipient
    "client": {
        "company": "Client Corp",
        "address": "Clientstreet 456",
        "zip": "4567 CD",
        "city": "Clientcity",
        "country": "Clientcountry"
        // "custom1": "custom value 1",
        // "custom2": "custom value 2",
        // "custom3": "custom value 3"
    },
    "information": {
        // Invoice number
        "number": "2021.0001",
        // Invoice data
        "date": "12-12-2021",
        // Invoice due date
        "due-date": "31-12-2021"
    },
    // The products you would like to see on your invoice
    // Total values are being calculated automatically
    "products": [
        {
            "quantity": 2,
            "description": "Product 1",
            "tax-rate": 6,
            "price": 33.87
        },
        {
            "quantity": 4.1,
            "description": "Product 2",
            "tax-rate": 6,
            "price": 12.34
        },
        {
            "quantity": 4.5678,
            "description": "Product 3",
            "tax-rate": 21,
            "price": 6324.453456
        }
    ],
    // The message you would like to display on the bottom of your invoice
    "bottom-notice": "Kindly pay your invoice within 15 days.",
    // Settings to customize your invoice
    "settings": {
        "currency": "USD", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')        
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
    },
    // Translate your invoice to your preferred language
    "translate": {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal", // Defaults to 'Total'
        // "vat": "btw" // Defaults to 'vat'
    },

    };

        easyinvoice.createInvoice(data,  function (result) {
            // The response will contain a base64 encoded PDF file
          
            fs.writeFileSync('invoice.pdf',result.pdf,'base64')
            
            // console.log('PDF base64 string: ', result.pdf);
             resolve(result.pdf) 
            // Now this result can be used to save, download or render your invoice
            // Please review the documentation below on how to do this
        });
        // reject()

    })


}


const downloadInvoicePdf=(order)=>{

    return new Promise(async (resolve,reject)=>{

        try {
            const browser = await puppeteer.launch()
            const page = await browser.newPage()


            const content = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Invoice</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f7f7f7;
                        margin: 0;
                        padding: 0;
                    }
            
                    .text-center {
                        text-align: center;
                    }
            
                    .table-container {
                        width: 80%;
                        margin: 0 auto;
                        margin-top: 1.5rem;
                        border-radius: 5px;
                        background-color: #fff;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        padding: 20px;
                    }
            
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 1rem;
                    }
            
                    th, td {
                        text-align: left;
                        padding: 10px;
                        border-bottom: 1px solid #ddd;
                    }
            
                    th {
                        background-color: #f2f2f2;
                    }
            
                    .d-flex-column {
                        display: flex;
                        flex-direction: column;
                        align-items: flex-end;
                    }
            
                    .fw-bold {
                        font-weight: bold;
                    }
            
                    .total-row {
                        background-color: #f2f2f2;
                    }
            
                    .total-row td {
                        border-top: 1px solid #ddd;
                    }
            
                    * {
                        font-size: 14px;
                        color: #444;
                    }
                </style>
            </head>
            <body>
                <div class="text-center">
                    <h1>Invoice</h1>
                </div>
            
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th scope="col">SL. No</th>
                                <th scope="col">Product</th>
                                <th scope="col">Price</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Offer</th>
                                <th scope="col">Total Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map((item, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${item.productId.productname}</td>
                                    <td>${item.productId.price}</td>
                                    <td>${item.quantity}</td>
                                    <td>${'offer'}</td>
                                    <td>${item.quantity * item.productId.price}</td>
                                </tr>
                            `).join('')}
                            <tr class="total-row">
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>
                                    <div class="d-flex-column">
                                    <span>Discount:</span>
                                        <span>Total:</span>
                                       
                                        
                                    </div>
                                </td>
                                <td>
                                    <div class="d-flex-column">
                                        <span>${order.discountAmount}</span>
                                        <span>${order.totalAmount}</span>
                                       
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </body>
            </html>
            `;
            

    await page.setContent(content)
    await page.pdf({ path: 'invoice.pdf', format: 'A4' })

    await browser.close()

    const file = `${__dirname}/../invoice.pdf`
   
            resolve(file)   
        } catch (error) {
            reject(error)
        }

    })

}

const orderPagingation=(page,itemsPerPage)=>{
    return new Promise(async(resolve,reject)=>{
        try {
        const orders=await orderModal.find({})
        let ordersLength=Math.ceil(orders.length/itemsPerPage)
            resolve(ordersLength)
        } catch (error) {
            reject(error)
        }
    })
}

const updateProducts= (cart)=>{
    return new Promise(async(resolve,reject)=>{
        try {
            
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
              resolve(updatedProducts)
        } catch (error) {
            reject(error)
        }
    })

}


module.exports={
    createInvoice,downloadInvoicePdf,
    orderPagingation,updateProducts
}