//Selected HTML elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const logoutButton = document.getElementById("logout");
const employeesList = document.getElementById("employeesList");

//Checks if email and password are correctly formated
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;

  //Logs the user in if email and password are good,
  //shows and alert if email or password are incorrectly formated
  if (validateEmail(email) && validatePassword(password)) {
    setLoginCookie();
    showPtoInfo();
  } else {
    alert(
      "Nevaljan email ili lozinka. Molimo zadovoljite formu. Lozinka mora sadržavati bar 8 znakova: velika i mala slova, brojeve i specijalni znak."
    );
  }
});

//Listener for logout button
logoutButton.addEventListener("click", function () {
  hidePtoInfo();
});

//Function that asures email has username, @(at) sign and domain
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

//Function that asures password is correctly formated
//(atleast one uppercase, one lowercase, one number and one special sign, atleast 8 characters)
function validatePassword(password) {
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z\d]).{8,}$/;
  return re.test(password);
}

//Saving cookie for login session for 1 hour
function setLoginCookie() {
  document.cookie = "loggedIn=true; path=/; max-age=3600";
}

//Function checks if user is logged in
function isUserLoggedIn() {
  return document.cookie
    .split(";")
    .some((item) => item.trim().startsWith("loggedIn="));
}
