let tdna = new TypingDNA();

const password = document.getElementById("inputPassword");
const email = document.getElementById("inputEmail");
const name = document.getElementById("inputName");
const form = document.getElementById("form");

tdna.addTarget("inputPassword");
tdna.addTarget("inputName");
tdna.addTarget("inputEmail");

console.log(password, name, email);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let pattern = tdna.getTypingPattern();

  // Send a POST request
  const response = await axios({
    method: "post",
    url: "http://localhost:8080/api/v1/auth/signup",
    data: {
      name: name.value,
      email: email.value,
      password: password.value,
      pattern: pattern,
    },
    validateStatus: () => true,
  });

  if (response.status == 200) {
    //
  }
});
