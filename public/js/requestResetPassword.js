const email = document.getElementById("inputEmail");
const form = document.getElementById("form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Send a POST request
  const response = await axios({
    method: "post",
    url: "http://localhost:8080/api/v1/auth/requestResetPassword",
    data: {
      email: email.value,
    },
    validateStatus: () => true,
  });

  if (response.status == 200) {
    //
    alert(
      "Your password reset request was sent successfully, check your email to complete your password reset"
    );
    // window.location = `http://${response.data}`;
  }
});
