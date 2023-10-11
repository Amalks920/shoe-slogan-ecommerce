const promocodeInput=document.querySelector('#code');
const submitForm=document.querySelector('#submit-form');
const selectElement = document.querySelector('select[name="discountType"]');
const descriptionInput=document.querySelector('#description');
const discountAmountInput=document.querySelector('#discountAmount');
const minimumAmountInput=document.querySelector('#minimumAmount');
const maxRedemptionsInput=document.querySelector('#maxRedemptions');
const expirationDateInput=document.querySelector('#expirationDate');

//RegExp
let promocodeRegExp= /^[A-Z][A-Z0-9]{5,19}$/
let descriptionRegExp = /^[A-Za-z0-9\s.,!?'"()\-][A-Za-z0-9\s.,!?'"()\-]{0,500}[A-Za-z0-9\s.,!?'"()\-]$/;
let discountAmountRegExp = /^\d+(\.\d{1,2})?$/;


submitForm.addEventListener('submit', function (event){
const form=event.target
const formData=new FormData(form)
let promocode=formData.get('code').trim()
let description=formData.get('description').trim()
let discountAmount=formData.get('discountAmount')
let discountType=formData.get('discountType')
let minimumAmount=formData.get('minimumAmount')
let maxRedemptions=formData.get('maxRedemptions')
let expirationDate=formData.get('expirationDate')


promocodeInput.classList.remove('is-invalid')
descriptionInput.classList.remove('is-invalid')
discountAmountInput.classList.remove('is-invalid')
minimumAmountInput.classList.remove('is-invalid')
maxRedemptionsInput.classList.remove('is-invalid')
selectElement.classList.remove('is-invalid')
expirationDateInput.classList.remove('is-invalid')

if(!validate(promocodeRegExp,promocode)){
  promocodeInput.classList.add('is-invalid')
  event.preventDefault()
}
  
if(!validate(descriptionRegExp,description)){
  descriptionInput.classList.add('is-invalid')
  event.preventDefault()
}

if(!validate(discountAmountRegExp,discountAmount)){
  discountAmountInput.classList.add('is-invalid')
  event.preventDefault()
}

if(!validate(discountAmountRegExp,minimumAmount)){
  minimumAmountInput.classList.add('is-invalid')
  event.preventDefault()
}

if(!validate(discountAmountRegExp,maxRedemptions)){
 maxRedemptionsInput.classList.add('is-invalid')
  event.preventDefault()
}

if(discountType===""){
  selectElement.classList.add('is-invalid')
  event.preventDefault()
}

if(expirationDate===""){
  expirationDateInput.classList.add('is-invalid')
  event.preventDefault()
}
})

//validations
function validate(regExp,value){
   return regExp.test(value)
}



const yesterday=new Date();
yesterday.setDate(yesterday.getDate());

const formatedYesterDay=yesterday.toISOString().slice(0,16);
document.getElementById('expirationDate').setAttribute('min',formatedYesterDay)