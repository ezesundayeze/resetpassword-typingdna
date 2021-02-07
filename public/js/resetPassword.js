let tdna = new TypingDNA();

const password = document.getElementById("inputPassword");
const form = document.getElementById("form");
const searchParams = new URLSearchParams(window.location.search);
const token = searchParams.get("token");
const userId = searchParams.get("id");

tdna.addTarget("inputPassword");
tdna.addTarget("inputPassword2");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let pattern = tdna.getTypingPattern();

  // Send a POST request
  const response = await axios({
    method: "post",
    url: "http://localhost:8080/api/v1/auth/resetPassword",
    data: {
      password: password.value,
      token: token,
      pattern: pattern,
      userId: userId,
    },
    validateStatus: () => true,
  });

  if (response.status == 200) {
    //Do something
  }
});
