const form = document.querySelector('#add-post-form');
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const profileImage = document.querySelector('#profile_image');
const password = document.querySelector('#password');
const confirmPassword = document.querySelector('#confirm_password');

function validateForm() {
  let isValid = true;

  if (name.value.trim() === '') {
    isValid = false;
    name.classList.add('is-invalid');
  } else {
    name.classList.remove('is-invalid');
  }

  if (email.value.trim() === '') {
    isValid = false;
    email.classList.add('is-invalid');
  } else {
    email.classList.remove('is-invalid');
  }

  if (profileImage.value.trim() === '') {
    isValid = false;
    profileImage.classList.add('is-invalid');
  } else {
    profileImage.classList.remove('is-invalid');
  }

  if (password.value.trim() === '') {
    isValid = false;
    password.classList.add('is-invalid');
  } else {
    password.classList.remove('is-invalid');
  }

  if (confirmPassword.value.trim() === '' || confirmPassword.value.trim() !== password.value.trim()) {
    isValid = false;
    confirmPassword.classList.add('is-invalid');
  } else {
    confirmPassword.classList.remove('is-invalid');
  }

  return isValid;
}

form.addEventListener('submit', (event) => {
  if (!validateForm()) {
    event.preventDefault();
  }
});