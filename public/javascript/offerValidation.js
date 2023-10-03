
const offerForm = document.getElementById("offerForm");
const offerNameInput = document.getElementById("offerName");
const productCategorySelect = document.querySelector(
  'select[name="offerType"]'
);
const descriptionInput = document.getElementById("description");
const discountInput = document.getElementById("discount");
const stockInput = document.getElementById("stock");
const imagesInput = document.querySelector('input[type="file"]');
const submitButton = document.querySelector('button[type="submit"]');
const offerType=document.querySelector('#offerType')
const discountType=document.querySelector('#discountType')


offerForm.addEventListener('submit',function(event){
  let isValid=true;

    offerNameInput.classList.remove('is-invalid');

   
    descriptionInput.classList.remove('is-invalid');
    discountInput.classList.remove('is-invalid');
    offerType.classList.remove('is-invalid');

    
    
    if (offerNameInput.value.trim() === '' || !validateOfferName(offerNameInput.value.trim())) {
      isValid = false;
      offerNameInput.classList.add('is-invalid');
    }

 

    if (descriptionInput.value.trim() === '' || !validateDescription(descriptionInput.value.trim())) {
        isValid = false;
        descriptionInput.classList.add('is-invalid');
    }
    console.log(discountInput.value)
    
    if (discountInput.value ==="") {
        isValid = false;
        discountInput.classList.add('is-invalid');
    }
   
    if (offerType.selectedIndex===0) {
        isValid = false;
        offerType.classList.add('is-invalid');
    }

    if (discountType.selectedIndex===0) {
        isValid = false;
        discountType.classList.add('is-invalid');
    }



    if (!isValid) {
        event.preventDefault(); 
    }
    
})




function imageCropModal(img) {

  cropImg(img);
}





function validateOfferName(value){

offerNameRegExpPattern=/^[A-Z][A-Za-z0-9\s]{5,19}$/


return offerNameRegExpPattern.test(value)

}


function validateDescription(value) {
const descriptionRegExpPattern = /^(?![0-9])[A-Za-z0-9\s.,!?'"()\-]{3,100}$/


return descriptionRegExpPattern.test(value);
}

