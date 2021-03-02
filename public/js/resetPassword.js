let tdna = new TypingDNA();

var autocompleteDisabler = new AutocompleteDisabler({
  showTypingVisualizer: true,
  showTDNALogo: true,
});

autocompleteDisabler.disableAutocomplete();

const password = document.getElementById("inputPassword");
const form = document.getElementById("form");
const searchParams = new URLSearchParams(window.location.search);
const token = searchParams.get("token");
const userId = searchParams.get("id");

tdna.addTarget("pattern");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let pattern = tdna.getTypingPattern({
    type: 1,
    text: "The quick brown fox jumps over the lazy dog",
  });

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

  console.log(response);

  if (response.status == 200) {
    //Do something
    alert("Password changed successfully");
  }
});
