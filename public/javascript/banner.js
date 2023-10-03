
    const bannerForm = document.getElementById('bannerForm');
    const bannerNameInput = document.getElementById('bannername');
    const imagesInput = document.querySelector('input[type="file"]');
    const submitButton = document.querySelector('button[type="submit"]');
    const defaultCat=document.querySelector('#default-cat');
    const prodOfferSelect=document.querySelector('#prod-offer')


    bannerForm.addEventListener('submit', function (event) {
        let isValid = true;
        const selectedOption = prodOfferSelect.options[prodOfferSelect.selectedIndex];
        console.log(selectedOption.value)

     
        bannerNameInput.classList.remove('is-invalid');
        imagesInput.classList.remove('is-invalid');
        prodOfferSelect.classList.remove('is-invalid');


        if (bannerNameInput.value.trim() === '' || !validateBannerName(bannerNameInput.value.trim())) {
            isValid = false;
            bannerNameInput.classList.add('is-invalid');
        }

        if (imagesInput.files.length === 0) {
            isValid = false;
            imagesInput.classList.add('is-invalid');
        }

        if(selectedOption.value==1){
            isValid = false;
            prodOfferSelect.classList.add('is-invalid');
        }

        if(!validateFiles(imagesInput)){
            
   
      isValid = false;
      imagesInput.classList.add("is-invalid");
    }

        if (!isValid) {
            event.preventDefault(); 
        }
    });


function validateBannerName(value){

offerNameRegExpPattern=/^[A-Z][A-Za-z0-9\s]{5,19}$/


return offerNameRegExpPattern.test(value)

}


function validateFiles(input) {
  const files = input.files; 

  for (let i = 0; i < files.length; i++) {
    const file = files[i]; 
    const fileType = file.type;

    if (fileType.startsWith("image/")) {
     
      console.log(`File ${file.name} is an image.`);
    } else {
   
      console.log(`File ${file.name} is not an image.`);
      return false; 
    }
  }

  return true;
}
